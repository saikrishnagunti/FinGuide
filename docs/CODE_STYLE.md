<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>CODE_STYLE.md</strong></div>
  <span style="background: #E0E7FF; color: #4338CA; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Clean. Consistent. Maintainable.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Code Style Guide</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">Standards, naming conventions, and best practices across the FinGuide codebase.</p>

<!-- 01 Philosophy -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Philosophy</h2>
  </div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    <div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 12px; padding: 16px;">
      <div style="font-size: 18px; margin-bottom: 4px;">📖</div>
      <div style="font-size: 13px; font-weight: 700; color: #9D174D; margin-bottom: 4px;">Clarity Over Cleverness</div>
      <div style="font-size: 11px; color: #BE185D; line-height: 1.4;">Readable control flow is prioritized over compressed one-liners. Code should be self-explanatory.</div>
    </div>
    <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 16px;">
      <div style="font-size: 18px; margin-bottom: 4px;">🛡️</div>
      <div style="font-size: 13px; font-weight: 700; color: #065F46; margin-bottom: 4px;">Defensive Boundaries</div>
      <div style="font-size: 11px; color: #059669; line-height: 1.4;">Validate all inputs at HTTP boundaries, file parsers, and database queries.</div>
    </div>
    <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px;">
      <div style="font-size: 18px; margin-bottom: 4px;">✨</div>
      <div style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Zero UI Slop</div>
      <div style="font-size: 11px; color: #3B82F6; line-height: 1.4;">No backend library names, internal database engines, or model codes in the user interface.</div>
    </div>
  </div>
</div>

<!-- 02 React & 03 Python (Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;">
  
  <!-- 02 JavaScript & React Standards -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #3B82F6; font-weight: 800; font-size: 16px;">02</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">React & JavaScript</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.8;">
      <div>✔ <strong>ES Modules</strong> (<code>import/export</code>) across all frontend and Node files</div>
      <div>✔ <strong>Functional Components</strong> with named/default exports</div>
      <div>✔ <strong>State Immutability:</strong> Always spread state objects and arrays</div>
      <div>✔ <strong>Lifecycle Safety:</strong> Proper cleanup functions in <code>useEffect</code></div>
      <div>✔ <strong>Component Naming:</strong> <code>PascalCase.jsx</code> for components & pages</div>
      <div>✔ <strong>Service Naming:</strong> <code>kebab-case.js</code> for backend utilities</div>
    </div>
  </div>

  <!-- 03 Python & FastAPI Standards -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #10B981; font-weight: 800; font-size: 16px;">03</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Python & FastAPI</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.8;">
      <div>✔ <strong>PEP 8 Compliance:</strong> 4-space indentation, snake_case identifiers</div>
      <div>✔ <strong>Type Annotations:</strong> Enforce type hints on all functions</div>
      <div>✔ <strong>Pydantic Schemas:</strong> Validate all request/response models</div>
      <div>✔ <strong>Async Endpoints:</strong> Use <code>async def</code> for FastAPI route handlers</div>
      <div>✔ <strong>Tool Isolation:</strong> Agent tools under <code>agent/app/tools/</code></div>
      <div>✔ <strong>Defensive Parsing:</strong> Gracefully handle malformed PDF tables</div>
    </div>
  </div>

</div>

<!-- 04 CSS Tokens & 05 Database Conventions (Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
  
  <!-- 04 CSS Tokens -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #F59E0B; font-weight: 800; font-size: 16px;">04</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">CSS Design Tokens</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.8;">
      <div>✔ <strong>No Hardcoded Hex:</strong> Use <code>var(--accent-primary)</code>, <code>var(--bg-card)</code></div>
      <div>✔ <strong>8px Spatial Grid:</strong> Use <code>var(--space-sm)</code>, <code>var(--space-md)</code>, etc.</div>
      <div>✔ <strong>Dark Mode Variables:</strong> Centralized in <code>index.css</code></div>
      <div>✔ <strong>Tabular Numbers:</strong> Use monospace/tabular numbers for currencies</div>
    </div>
  </div>

  <!-- 05 Database Conventions -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #6366F1; font-weight: 800; font-size: 16px;">05</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Database & SQL</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.8;">
      <div>✔ <strong>Parameterized Queries:</strong> Always bind query variables to prevent SQLi</div>
      <div>✔ <strong>Disk Synchronization:</strong> Call <code>saveDatabase()</code> on writes</div>
      <div>✔ <strong>Snake Case Columns:</strong> <code>created_at</code>, <code>password_hash</code>, <code>locked_until</code></div>
      <div>✔ <strong>Transactions:</strong> Wrap multi-table bulk updates in transactions</div>
    </div>
  </div>

</div>

</div>
