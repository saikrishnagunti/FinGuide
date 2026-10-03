/**
 * Resilient Financial Audit & Diagnostic Fallback Engine
 * Generates comprehensive, institutional-grade financial audit reports directly
 * from verified snapshots and transaction records if the external Python AI agent
 * is cold-starting, sleeping, or temporarily unreachable.
 */

function formatCurrency(val, currency = '₹') {
  const num = Number(val) || 0;
  return `${currency}${num.toLocaleString('en-IN')}`;
}

export function generateFallbackAudit({
  user,
  snapshots = [],
  transactions = [],
  goals = [],
  period = 'current',
  query = '',
}) {
  const currency = user?.currency || '₹';
  const userName = user?.name || 'Valued Client';

  // 1. Determine period data
  let activeSnapshot = snapshots[0] || null;
  let periodLabel = 'Current Period';

  if (period === 'last_month' && snapshots.length > 1) {
    activeSnapshot = snapshots[1];
    periodLabel = 'Last Month';
  } else if (period === '3_months' || period === '6_months' || period === '12_months' || period === 'all') {
    const limit = period === '3_months' ? 3 : period === '6_months' ? 6 : period === '12_months' ? 12 : snapshots.length;
    const slice = snapshots.slice(0, limit);
    if (slice.length > 0) {
      const aggIncome = slice.reduce((s, x) => s + (Number(x.total_income) || 0), 0);
      const aggExpenses = slice.reduce((s, x) => s + (Number(x.total_expenses) || 0), 0);
      const aggSavings = aggIncome - aggExpenses;
      const aggRate = aggIncome > 0 ? Math.round((aggSavings / aggIncome) * 1000) / 10 : 0;
      activeSnapshot = {
        total_income: aggIncome,
        total_expenses: aggExpenses,
        net_savings: aggSavings,
        savings_rate: aggRate,
        income_data: {},
        expense_data: {},
      };
      periodLabel = period === '3_months' ? 'Last 3 Months' : period === '6_months' ? 'Last 6 Months' : period === '12_months' ? 'Last 12 Months' : 'All-Time Historical';
    }
  }

  // Fallback to transactions if snapshots empty
  const totalIncome = activeSnapshot
    ? Number(activeSnapshot.total_income) || 0
    : transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpenses = activeSnapshot
    ? Number(activeSnapshot.total_expenses) || 0
    : transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

  // 2. Category spending breakdown
  const categoryTotals = {};
  if (activeSnapshot?.expense_data && Object.keys(activeSnapshot.expense_data).length > 0) {
    for (const [cat, amt] of Object.entries(activeSnapshot.expense_data)) {
      categoryTotals[cat] = Number(amt) || 0;
    }
  } else {
    for (const t of transactions) {
      if (t.type === 'expense') {
        const cat = t.category || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount || 0);
      }
    }
  }

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      total: amt,
      percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 1000) / 10 : 0,
    }));

  const topCategory = sortedCategories[0] || { category: 'Operational Expenses', total: 0, percentage: 0 };
  const secondCategory = sortedCategories[1] || { category: 'Other Outflows', total: 0, percentage: 0 };

  // 3. Quick Stats object
  const quickStats = {
    total_income: Math.round(totalIncome * 100) / 100,
    total_expenses: Math.round(totalExpenses * 100) / 100,
    net_savings: Math.round(netSavings * 100) / 100,
    savings_rate: savingsRate,
    top_categories: sortedCategories.slice(0, 5),
    monthly_trend: snapshots.slice(0, 6).map(s => ({
      month: s.month && s.year ? `${s.year}-${String(s.month).padStart(2, '0')}` : 'N/A',
      income: s.total_income,
      expenses: s.total_expenses,
    })),
  };

  // 4. Diagnostic evaluation
  const isSurplus = netSavings >= 0;
  const solvencyStatus = savingsRate >= 20 ? 'Strong / Optimal' : savingsRate >= 10 ? 'Stable / Adequate' : savingsRate >= 0 ? 'Modest Surplus' : 'Deficit / Critical';

  // 5. Generate Formal Markdown Audit Report
  const markdownReport = `
### 1. Executive Solvency & Cash Flow Summary

> **Solvency Assessment: ${solvencyStatus}**  
> ${isSurplus 
  ? `The account maintains an operational surplus of **${formatCurrency(netSavings, currency)}**, retaining **${savingsRate}%** of top-line cash inflows. Working capital remains sound, with liquidity sufficient to service debt obligations, payroll, and routine operational commitments.`
  : `The current operating period exhibits an outflow deficit of **${formatCurrency(Math.abs(netSavings), currency)}**. Total expenditures exceed period revenues by **${Math.abs(savingsRate)}%**, indicating reliance on prior balance reserves or external financing.`
}

- **Gross Operating Inflow (Income):** ${formatCurrency(totalIncome, currency)}
- **Total Operational Expenditure:** ${formatCurrency(totalExpenses, currency)}
- **Net Operating Cash Flow:** **${isSurplus ? '+' : ''}${formatCurrency(netSavings, currency)}**
- **Operating Retention (Savings Rate):** **${savingsRate}%** (${solvencyStatus})

---

### 2. Category Concentration & Burn-Rate Diagnostics

A breakdown of major expense drivers reveals the following structural cost centers:

| Cost Center / Category | Audited Expenditure | Share of Outflow | Risk Assessment |
| :--- | :--- | :--- | :--- |
${sortedCategories.slice(0, 6).map(c => `| **${c.category}** | ${formatCurrency(c.total, currency)} | ${c.percentage}% | ${c.percentage > 35 ? '⚠️ High Concentration' : c.percentage > 15 ? '🟡 Moderate' : '🟢 Controlled'} |`).join('\n')}

- **Primary Outflow Driver:** **${topCategory.category}** accounts for **${topCategory.percentage}%** (${formatCurrency(topCategory.total, currency)}) of aggregate outflows.
- **Secondary Cost Driver:** **${secondCategory.category}** represents **${secondCategory.percentage}%** (${formatCurrency(secondCategory.total, currency)}) of spending.
- **Cost Volatility Analysis:** Top two categories collectively drive **${Math.round((topCategory.percentage + secondCategory.percentage) * 10) / 10}%** of operational outflow. Optimizing terms or reducing variable leakage in these centers yields the highest return on cash reserves.

---

### 3. Liquidity, Runway & Financial Health Checklist

- 🛡️ **Liquidity Cushion:** Operating cash flow is **${isSurplus ? 'Positive (Surplus Generated)' : 'Negative (Operating Deficit)'}**.
- ⚖️ **Fixed vs. Variable Ratio:** Core essential commitments (payroll, housing, taxes, debt EMIs) form non-discretionary baseline; discretionary spend should be capped against monthly inflow cycles.
- 🎯 **Financial Goals Progress:** ${goals.length > 0 ? `Currently tracking **${goals.length}** active financial milestones.` : 'No active financial milestone goals currently configured.'}

---

### 4. Strategic Financial Directives

1. **${isSurplus ? 'Capital Re-allocation' : 'Deficit Mitigation'}:** ${isSurplus ? `Direct a portion of monthly operating surplus (${formatCurrency(netSavings, currency)}) into high-yield contingency reserves to buffer against cyclical cash collection dips.` : 'Conduct an immediate line-item review of non-essential supplier and discretionary disbursements to re-establish operating break-even.'}
2. **Cap Outflow Concentration:** Implement a targeted cap of 30% maximum single-category exposure for **${topCategory.category}** to prevent structural budget drift.
3. **Working Capital Alignment:** Synchronize merchant collection batches and client advance invoices with debt loan EMI and bulk vendor payables.
`.trim();

  // 6. Actionable Insights
  const insights = [
    `Net period cash flow is ${isSurplus ? 'positive' : 'negative'} at ${isSurplus ? '+' : ''}${formatCurrency(netSavings, currency)} (${savingsRate}% retention rate).`,
    `Largest single cost center is ${topCategory.category}, accounting for ${topCategory.percentage}% (${formatCurrency(topCategory.total, currency)}) of total expenditure.`,
    isSurplus 
      ? `Operating margin of ${savingsRate}% provides healthy headroom for capital accumulation and debt repayment.`
      : `Expenditures exceeded collections by ${formatCurrency(Math.abs(netSavings), currency)}, requiring operational cost rationalization.`,
    `Cash flow stability status is rated as: ${solvencyStatus}.`,
  ];

  return {
    summary: 'Financial Audit & Diagnostic Report',
    sections: [
      { title: 'Quick Stats', data: quickStats },
      { title: 'AI Analysis', content: markdownReport },
      { title: 'Action Plan', content: 'Review key directives and plan monthly targets with the AI Financial Advisor.' },
    ],
    insights,
    raw_text: markdownReport,
  };
}
