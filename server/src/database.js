import initSqlJs from 'sql.js';
import config from './config.js';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { createClient } from '@libsql/client';

// Ensure the data directory exists
mkdirSync(dirname(config.databasePath), { recursive: true });

let rawDb = null;
let tursoClient = null;

function getTursoClient() {
  if (!tursoClient && config.tursoDatabaseUrl && config.tursoAuthToken) {
    try {
      tursoClient = createClient({
        url: config.tursoDatabaseUrl,
        authToken: config.tursoAuthToken,
      });
    } catch (e) {
      console.warn('[Database] Failed to initialize Turso client:', e.message);
    }
  }
  return tursoClient;
}

function normalizeParams(args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    return args[0].map(v => (v === undefined ? null : v));
  }
  return args.map(v => (v === undefined ? null : v));
}

/**
 * Initialize the sql.js database and create tables.
 */
export async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB file if present
  if (existsSync(config.databasePath)) {
    try {
      const buffer = readFileSync(config.databasePath);
      rawDb = new SQL.Database(buffer);
    } catch (e) {
      console.warn('Warning: Could not read existing DB file, creating fresh DB:', e.message);
      rawDb = new SQL.Database();
    }
  } else {
    rawDb = new SQL.Database();
  }

  // Enable foreign keys
  rawDb.run('PRAGMA foreign_keys = ON;');

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      currency TEXT DEFAULT '₹',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS ie_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      income_data TEXT NOT NULL,
      expense_data TEXT NOT NULL,
      total_income REAL NOT NULL DEFAULT 0,
      total_expenses REAL NOT NULL DEFAULT 0,
      net_savings REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, month, year)
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT DEFAULT 'Uncategorized',
      source TEXT DEFAULT 'manual',
      upload_batch_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'achieved', 'paused')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      ip_address TEXT,
      attempt_count INTEGER DEFAULT 1,
      locked_until DATETIME,
      last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  rawDb.run(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create indices
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_ie_snapshots_user ON ie_snapshots(user_id, year, month);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, date);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otps(email, purpose);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);');
  rawDb.run('CREATE INDEX IF NOT EXISTS idx_security_logs_email ON security_logs(email);');

  // Sync from Turso cloud if connected
  const turso = getTursoClient();
  if (turso) {
    try {
      console.log('🌐 Connecting to Turso cloud database...');
      const tables = ['users', 'ie_snapshots', 'transactions', 'goals', 'otps', 'login_attempts', 'security_logs'];
      let syncedCount = 0;

      for (const table of tables) {
        try {
          const res = await turso.execute(`SELECT * FROM ${table}`);
          if (res && res.rows && res.rows.length > 0) {
            syncedCount += res.rows.length;
            for (const row of res.rows) {
              const keys = Object.keys(row);
              const vals = Object.values(row);
              const placeholders = keys.map(() => '?').join(', ');
              rawDb.run(
                `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
                vals
              );
            }
          }
        } catch (tableErr) {
          console.warn(`[TursoSync] Table ${table} sync note:`, tableErr.message);
        }
      }
      console.log(`✅ Synchronized ${syncedCount} records from Turso cloud database!`);
    } catch (tursoErr) {
      console.warn('[TursoSync] Cloud sync error:', tursoErr.message);
    }
  }

  // ── Auto-Migration for Category Refinement ──
  try {
    const { autoCategorize } = await import('./services/statement-parser.js');
    const { syncSnapshotsFromTransactions } = await import('./routes/transactions.js');
    const dbWrap = getDb();

    // 1. Fix expenses categorized as 'Salary & Income' to 'Payroll & Salaries'
    rawDb.run("UPDATE transactions SET category = 'Payroll & Salaries' WHERE type = 'expense' AND category = 'Salary & Income'");

    // 2. Refine existing 'General' transactions if they match recognized categories
    const stmt = rawDb.prepare("SELECT id, description, type, user_id FROM transactions WHERE category = 'General'");
    const userIdsToSync = new Set();
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.description) {
        const refinedCat = autoCategorize(row.description, null, row.type || 'expense');
        if (refinedCat && refinedCat !== 'General') {
          rawDb.run("UPDATE transactions SET category = ? WHERE id = ?", [refinedCat, row.id]);
          if (row.user_id) userIdsToSync.add(row.user_id);
        }
      }
    }
    stmt.free();

    // 3. Re-sync monthly snapshots for affected users
    for (const uid of userIdsToSync) {
      syncSnapshotsFromTransactions(dbWrap, uid);
    }

    if (userIdsToSync.size > 0) {
      console.log(`[Database] Successfully refined transaction categories and synced snapshots for ${userIdsToSync.size} user(s).`);
    }
  } catch (migErr) {
    console.warn('[Database] Category migration note:', migErr.message);
  }

  saveDatabase();
  console.log('✅ Database initialized successfully');
  return getDb();
}

/**
 * Persist the in-memory database to disk.
 */
export function saveDatabase() {
  if (rawDb) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    writeFileSync(config.databasePath, buffer);
  }
}

/**
 * Creates the database wrapper compatible with both direct methods and .prepare()
 */
export function getDb() {
  if (!rawDb) throw new Error('Database not initialized. Call initializeDatabase() first.');

  const wrapper = {
    all(sql, ...args) {
      const flat = normalizeParams(args);
      try {
        const stmt = rawDb.prepare(sql);
        if (flat.length > 0) stmt.bind(flat);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (e) {
        console.error('DB all() error:', e.message, sql, flat);
        throw e;
      }
    },

    get(sql, ...args) {
      const flat = normalizeParams(args);
      try {
        const stmt = rawDb.prepare(sql);
        if (flat.length > 0) stmt.bind(flat);
        let result;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      } catch (e) {
        console.error('DB get() error:', e.message, sql, flat);
        throw e;
      }
    },

    run(sql, ...args) {
      const flat = normalizeParams(args);
      try {
        rawDb.run(sql, flat);
        const changes = rawDb.getRowsModified();
        const lastRow = rawDb.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = (lastRow.length > 0 && lastRow[0].values.length > 0)
          ? lastRow[0].values[0][0]
          : 0;
        saveDatabase();

        // Asynchronously replicate write to Turso cloud
        const turso = getTursoClient();
        if (turso) {
          turso.execute({ sql, args: flat }).catch(err => {
            console.warn('[TursoSync] Cloud write replication error:', err.message);
          });
        }

        return { changes, lastInsertRowid };
      } catch (e) {
        console.error('DB run() error:', e.message, sql, flat);
        throw e;
      }
    },

    exec(sql) {
      rawDb.run(sql);
      saveDatabase();
      const turso = getTursoClient();
      if (turso) {
        turso.executeMultiple(sql).catch(err => {
          console.warn('[TursoSync] Cloud exec replication error:', err.message);
        });
      }
    },

    prepare(sql) {
      return {
        all: (...args) => wrapper.all(sql, ...args),
        get: (...args) => wrapper.get(sql, ...args),
        run: (...args) => wrapper.run(sql, ...args),
      };
    },
  };

  return wrapper;
}

const defaultDb = new Proxy({}, {
  get(target, prop) {
    const active = getDb();
    if (typeof active[prop] === 'function') {
      return active[prop].bind(active);
    }
    return active[prop];
  }
});

export default defaultDb;
