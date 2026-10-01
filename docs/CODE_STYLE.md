<div align="right">
<span style="background: #E0E7FF; color: #4338CA; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Clean. Consistent. Maintainable.</span>
</div>

# 💻 CODE_STYLE.md
# Code Style Guide
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Standards, naming conventions, and best practices across the FinGuide codebase.</p>

---

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #9333EA; font-weight: 800; font-size: 16px;">01</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Philosophy</h3>
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

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">React & JavaScript</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div>✔ <strong>ES Modules:</strong> <code>import/export</code> syntax across all frontend and Node files</div>
<div>✔ <strong>Functional Components:</strong> Clean JSX components with hooks</div>
<div>✔ <strong>State Immutability:</strong> Always spread state objects and arrays (<code>[...prev]</code>)</div>
<div>✔ <strong>Lifecycle Safety:</strong> Proper cleanup return functions in <code>useEffect</code></div>
<div>✔ <strong>Component Naming:</strong> <code>PascalCase.jsx</code> for components & pages</div>
<div>✔ <strong>Service Naming:</strong> <code>kebab-case.js</code> for backend utilities</div>
</div>
</div>

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Python & FastAPI</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div>✔ <strong>PEP 8 Compliance:</strong> 4-space indentation, snake_case identifiers</div>
<div>✔ <strong>Type Annotations:</strong> Enforce type hints on all function signatures</div>
<div>✔ <strong>Pydantic Schemas:</strong> Validate all request/response models</div>
<div>✔ <strong>Async Endpoints:</strong> Use <code>async def</code> for FastAPI route handlers</div>
<div>✔ <strong>Defensive Parsing:</strong> Gracefully handle malformed PDF tables and rows</div>
<div>✔ <strong>Safety Guards:</strong> Clean PII redaction and financial advisory disclaimers</div>
</div>
</div>

</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #F59E0B; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">CSS Design Tokens</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div>✔ <strong>No Hardcoded Hex:</strong> Use <code>var(--accent-primary)</code>, <code>var(--bg-card)</code></div>
<div>✔ <strong>8px Spatial Grid:</strong> Use <code>var(--space-sm)</code>, <code>var(--space-md)</code>, etc.</div>
<div>✔ <strong>Dark Mode Variables:</strong> Centralized tokens in <code>index.css</code></div>
<div>✔ <strong>Tabular Numbers:</strong> Use monospace/tabular numbers for currencies</div>
</div>
</div>

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #6366F1; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Database & SQL</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; font-size: 12px; color: #334155; line-height: 1.9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div>✔ <strong>Parameterized Queries:</strong> Always bind query variables to prevent SQLi</div>
<div>✔ <strong>Turso Cloud Replication:</strong> Sync state mutations via <code>saveDatabase()</code></div>
<div>✔ <strong>Snake Case Columns:</strong> <code>created_at</code>, <code>password_hash</code>, <code>locked_until</code></div>
<div>✔ <strong>Transactions:</strong> Wrap multi-table bulk updates in transactions</div>
</div>
</div>

</div>
