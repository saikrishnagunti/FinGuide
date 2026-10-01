/**
 * Resilient Budget Proposal Engine
 * Generates a data-grounded, personalized monthly budget when the external
 * Python AI service is sleeping or unreachable on Render free tier.
 * Uses the 50/30/20 framework as a baseline, then adapts to actual spend.
 */

/**
 * Build a fallback budget proposal from verified snapshot and transaction data.
 *
 * @param {object} params
 * @param {object} params.user - { id, name, currency }
 * @param {Array}  params.snapshots - ie_snapshots rows (parsed), most recent first
 * @param {Array}  params.transactions - recent transaction rows
 * @param {Array}  params.goals - active goal rows
 * @returns {{ raw_text: string, insights: string[], status: string }}
 */
export function generateFallbackBudget({ user = {}, snapshots = [], transactions = [], goals = [] }) {
  const currency = user?.currency || '₹';
  const userName = user?.name || 'there';

  // ── 1. Determine baseline income & expenses ──────────────────────────────
  const latest = snapshots[0] || {};
  const monthlyIncome = Number(latest.total_income) || 0;
  const monthlyExpenses = Number(latest.total_expenses) || 0;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;

  // Multi-month averages for stability (last 3 snapshots)
  const slice = snapshots.slice(0, 3);
  const avgIncome = slice.length > 0
    ? Math.round(slice.reduce((s, r) => s + (Number(r.total_income) || 0), 0) / slice.length)
    : monthlyIncome;
  const avgExpenses = slice.length > 0
    ? Math.round(slice.reduce((s, r) => s + (Number(r.total_expenses) || 0), 0) / slice.length)
    : monthlyExpenses;

  // ── 2. Pull category breakdown from latest snapshot ───────────────────────
  const expenseData = latest.expense_data || {};
  const incomeData = latest.income_data || {};

  const categories = Object.entries(expenseData)
    .map(([cat, amt]) => ({ cat, amt: Number(amt) || 0 }))
    .filter(c => c.amt > 0)
    .sort((a, b) => b.amt - a.amt);

  const incomeSources = Object.entries(incomeData)
    .map(([src, amt]) => ({ src, amt: Number(amt) || 0 }))
    .filter(c => c.amt > 0)
    .sort((a, b) => b.amt - a.amt);

  // ── 3. Compute 50/30/20-inspired budget targets ───────────────────────────
  // Needs (essentials): ~50% of income → rent, utilities, groceries, insurance
  // Wants (discretionary): ~30% → dining, entertainment, shopping
  // Savings / goals: ~20% minimum
  const needsKeywords = /rent|groceries|utilities|insurance|transport|emi|loan|medical|fuel|electricity|water|internet/i;
  const wantsKeywords = /dining|restaurant|entertainment|shopping|subscription|leisure|travel|hotel|fashion|beauty/i;

  let needsTotal = 0;
  let wantsTotal = 0;
  let otherTotal = 0;

  const categorized = categories.map(({ cat, amt }) => {
    let bucket = 'other';
    if (needsKeywords.test(cat)) { needsTotal += amt; bucket = 'needs'; }
    else if (wantsKeywords.test(cat)) { wantsTotal += amt; bucket = 'wants'; }
    else { otherTotal += amt; bucket = 'other'; }
    return { cat, amt, bucket };
  });

  // Targets based on actual income
  const targetNeeds = Math.round(monthlyIncome * 0.50);
  const targetWants = Math.round(monthlyIncome * 0.30);
  const targetSavings = Math.round(monthlyIncome * 0.20);

  // ── 4. Per-category recommended caps ──────────────────────────────────────
  const catLines = categories.slice(0, 8).map(({ cat, amt }) => {
    const pct = monthlyExpenses > 0 ? Math.round((amt / monthlyExpenses) * 100) : 0;
    // Suggest a 10% efficiency improvement on categories over 15% of budget
    const suggested = pct > 15 ? Math.round(amt * 0.90) : amt;
    const flag = pct > 15 ? ' ⚠️ *high share — 10% reduction suggested*' : '';
    return `| ${cat} | ${currency}${amt.toLocaleString('en-IN')} | ${pct}% | ${currency}${suggested.toLocaleString('en-IN')}${flag} |`;
  });

  // ── 5. Goals section ──────────────────────────────────────────────────────
  const activeGoals = (goals || []).filter(g => g.status === 'active');
  const goalsText = activeGoals.length > 0
    ? activeGoals.map(g => {
        const remaining = (Number(g.target_amount) || 0) - (Number(g.current_amount) || 0);
        const monthsNeeded = monthlySurplus > 0 ? Math.ceil(remaining / monthlySurplus) : '?';
        return `- **${g.name}:** Target ${currency}${Number(g.target_amount).toLocaleString('en-IN')} — ${currency}${remaining.toLocaleString('en-IN')} remaining (~${monthsNeeded} months at current savings rate)`;
      }).join('\n')
    : '- *No active goals. Consider creating an Emergency Reserve Fund goal (3-6 months of expenses).*';

  // ── 6. Month label ────────────────────────────────────────────────────────
  const monthLabel = latest.month && latest.year
    ? new Date(latest.year, latest.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    : 'Current Month';

  // ── 7. Assemble report ────────────────────────────────────────────────────
  const needsStatus = needsTotal > targetNeeds ? `⚠️ Over target by ${currency}${(needsTotal - targetNeeds).toLocaleString('en-IN')}` : `✅ Within target`;
  const wantsStatus = wantsTotal > targetWants ? `⚠️ Over target by ${currency}${(wantsTotal - targetWants).toLocaleString('en-IN')}` : `✅ Within target`;
  const savingsStatus = monthlySurplus >= targetSavings ? `✅ Exceeds 20% savings target` : `⚠️ Currently ${savingsRate}% — target: 20%`;

  const incomeSourceLines = incomeSources.length > 0
    ? incomeSources.map(({ src, amt }) => `- **${src}:** ${currency}${amt.toLocaleString('en-IN')}`).join('\n')
    : `- **Total Inflow:** ${currency}${monthlyIncome.toLocaleString('en-IN')}`;

  const raw_text = `## 📊 Monthly Budget Proposal — ${monthLabel}

---

### 💰 Income Overview
${incomeSourceLines}

**Total Verified Inflow:** ${currency}${monthlyIncome.toLocaleString('en-IN')}  
**3-Month Rolling Average:** ${currency}${avgIncome.toLocaleString('en-IN')}

---

### 🎯 50/30/20 Budget Framework

| Category | Your Spend | Target | Status |
|----------|-----------|--------|--------|
| 🏠 Needs (Essentials 50%) | ${currency}${needsTotal.toLocaleString('en-IN')} | ${currency}${targetNeeds.toLocaleString('en-IN')} | ${needsStatus} |
| 🎭 Wants (Discretionary 30%) | ${currency}${wantsTotal.toLocaleString('en-IN')} | ${currency}${targetWants.toLocaleString('en-IN')} | ${wantsStatus} |
| 💾 Savings / Goals (20%) | ${currency}${monthlySurplus.toLocaleString('en-IN')} | ${currency}${targetSavings.toLocaleString('en-IN')} | ${savingsStatus} |

---

### 📋 Category-Level Budget Caps

| Category | Actual | % of Budget | Recommended Cap |
|----------|--------|------------|-----------------|
${catLines.join('\n')}

---

### 🏆 Active Financial Goals

${goalsText}

---

### 💡 Budget Recommendations

1. **Maintain current savings momentum** — Your ${savingsRate}% savings rate is ${savingsRate >= 20 ? 'above' : 'approaching'} the recommended 20% threshold.
2. **Top expense area:** ${categories[0]?.cat || 'Operating Expenses'} at ${currency}${(categories[0]?.amt || 0).toLocaleString('en-IN')} — review monthly for discretionary cuts.
3. **Emergency Reserve:** Ensure you have 3-6 months of expenses (${currency}${(avgExpenses * 3).toLocaleString('en-IN')}–${currency}${(avgExpenses * 6).toLocaleString('en-IN')}) in liquid savings before allocating to long-term goals.
4. **Automate budget caps:** Set up spending alerts for any category exceeding its recommended cap mid-month.
5. **Review quarterly:** Revisit this plan every 3 months or after any significant change in income.

---

> ℹ️ **Note:** *This budget is generated from your verified financial records using the 50/30/20 framework. It is for educational and planning purposes only.*`;

  // ── 8. Key insights list ──────────────────────────────────────────────────
  const insights = [
    `Monthly inflow: ${currency}${monthlyIncome.toLocaleString('en-IN')} | Outflow: ${currency}${monthlyExpenses.toLocaleString('en-IN')} | Net: ${monthlySurplus >= 0 ? '+' : ''}${currency}${monthlySurplus.toLocaleString('en-IN')}`,
    `Savings rate: ${savingsRate}% (target: ≥20%)`,
    categories[0] ? `Largest spend: ${categories[0].cat} at ${currency}${categories[0].amt.toLocaleString('en-IN')} (${monthlyExpenses > 0 ? Math.round((categories[0].amt / monthlyExpenses) * 100) : 0}% of outflow)` : 'No category data available',
    `Emergency reserve target: ${currency}${(avgExpenses * 3).toLocaleString('en-IN')} (3 months of avg expenses)`,
    `3-month rolling average income: ${currency}${avgIncome.toLocaleString('en-IN')}`,
  ];

  return {
    raw_text,
    insights,
    status: 'ok',
    source: 'fallback_engine',
  };
}
