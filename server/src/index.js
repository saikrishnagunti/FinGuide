import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.js';
import { initializeDatabase } from './database.js';
import { authenticate } from './middleware/auth.js';
import { globalLimiter } from './middleware/rate-limiter.js';
import authRoutes from './routes/auth.js';
import ieRoutes from './routes/ie.js';
import transactionRoutes from './routes/transactions.js';
import goalsRoutes from './routes/goals.js';
import agentRoutes from './routes/agent.js';
import guestRoutes from './routes/guest.js';
import { agentClient } from './services/agent-client.js';

const app = express();

// Trust proxy for rate limiting behind Vite dev server / reverse proxies
app.set('trust proxy', 1);

// ──────────────────────────────────────────
// Middleware & Security Headers
// ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Let Vite/React handle inline scripts/assets
}));
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(config.corsOrigin ? config.corsOrigin.split(',').map(s => s.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow local development ports
    if (config.nodeEnv !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access for origin: ${origin}`));
  },
  credentials: true,
}));
app.use('/api', globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────

// Health check
app.get('/api/health', async (req, res) => {
  const agentHealth = await agentClient.healthCheck();
  res.json({
    status: 'ok',
    service: 'finguide-api',
    agent: agentHealth,
    timestamp: new Date().toISOString(),
  });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/guest', guestRoutes);

// Protected routes (require JWT)
app.use('/api/ie', authenticate, ieRoutes);
app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/goals', authenticate, goalsRoutes);
app.use('/api/agent', authenticate, agentRoutes);

// ──────────────────────────────────────────
// Error handling
// ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ──────────────────────────────────────────
// Start server
// ──────────────────────────────────────────
async function startServer() {
  await initializeDatabase();

  const server = app.listen(config.port, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║          FinGuide API Server                  ║
  ║   Running on http://localhost:${config.port}          ║
  ║   Agent:  ${config.agentServiceUrl}     ║
  ║   Mode:   ${config.nodeEnv}                 ║
  ╚═══════════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    console.error('API Server error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
