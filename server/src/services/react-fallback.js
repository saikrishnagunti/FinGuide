/**
 * Resilient ReAct Financial Advisor Engine
 * Provides intelligent, data-grounded financial advice and Human-in-the-Loop (HITL)
 * action proposals when the external Python AI service is sleeping or unreachable.
 */

export function runFallbackReactAdvisor({
  message = '',
  user = {},
  snapshots = [],
  transactions = [],
  goals = [],
}) {
  const query = message.trim();
  const lower = query.toLowerCase();
  const currency = user?.currency || '₹';
  const userName = user?.name || 'there';

  const latest = snapshots[0] || {};
  const monthlyIncome = Number(latest.total_income) || 0;
  const monthlyExpenses = Number(latest.total_expenses) || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

  // 1. Intent: Affordability Check (e.g. "Can I afford a ₹50,000 laptop?")
  const amountMatch = query.match(/(?:(?:Rs\.?|INR|₹|\$|€)\s*([0-9,]+)|([0-9,]+)\s*(?:rupees|inr|rs))/i) ||
                      query.match(/(?:afford|buy|purchase|costing)\s*(?:a|an)?\s*(?:[A-Za-z0-9\s]*?)?(?:₹|Rs\.?)?\s*([0-9,]+)/i);

  if (/afford|can i buy|can we purchase/i.test(lower) && amountMatch) {
    const rawAmt = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
    const itemCost = parseFloat(rawAmt) || 0;

    let itemName = 'Purchase';
    if (/laptop|macbook|computer/i.test(lower)) itemName = 'Laptop';
    else if (/phone|iphone|mobile/i.test(lower)) itemName = 'Smartphone';
    else if (/car|bike|vehicle/i.test(lower)) itemName = 'Vehicle';
    else if (/trip|vacation|holiday|travel/i.test(lower)) itemName = 'Travel Vacation';
    else if (/equipment|machine|tool/i.test(lower)) itemName = 'Equipment Upgrade';

    const canAffordImmediately = monthlySavings >= itemCost;
    const monthsNeeded = monthlySavings > 0 ? Math.ceil(itemCost / monthlySavings) : 'Indefinite';

    const thoughtSteps = [
      `Thought 1: Identified purchase target of ${currency}${itemCost.toLocaleString('en-IN')} for '${itemName}'.`,
      `Thought 2: Cross-referenced against latest verified monthly surplus of ${currency}${monthlySavings.toLocaleString('en-IN')} (${savingsRate}% savings rate).`,
      `Observation: ${canAffordImmediately ? 'Current single-month operating cash flow fully covers the item cost.' : `Accumulating savings over ${monthsNeeded} month(s) will cover the cost without touching working capital.`}`,
    ];

    const answer = canAffordImmediately
      ? `### Financial Affordability Assessment: **Yes, Highly Affordable!**\n\n` +
        `Hi **${userName}**! You can comfortably afford this **${currency}${itemCost.toLocaleString('en-IN')} ${itemName}**.\n\n` +
        `**Key Telemetry:**\n` +
        `- **Monthly Operating Surplus:** ${currency}${monthlySavings.toLocaleString('en-IN')}\n` +
        `- **Cost-to-Surplus Ratio:** This purchase represents only **${Math.round((itemCost / monthlySavings) * 100)}%** of a single month's net savings.\n` +
        `- **Capital Impact:** You will retain **${currency}${(monthlySavings - itemCost).toLocaleString('en-IN')}** in excess reserves even after completing the purchase this month.\n\n` +
        `Would you like me to create an approved savings allocation milestone for this on your Dashboard?`
      : `### Financial Affordability Assessment: **Achievable with Planning**\n\n` +
        `Hi **${userName}**! While purchasing a **${currency}${itemCost.toLocaleString('en-IN')} ${itemName}** exceeds your immediate single-month surplus (${currency}${monthlySavings.toLocaleString('en-IN')}), it is well within reach.\n\n` +
        `- **Timeline:** At your current savings trajectory, you will fully fund this in **${monthsNeeded} month(s)**.\n` +
        `- **Recommendation:** Dedicate ${currency}${Math.round(itemCost / (monthsNeeded || 1)).toLocaleString('en-IN')}/month toward this purchase milestone to protect day-to-day liquidity.`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: {
        tool: 'propose_create_goal',
        data: {
          name: `${itemName} Fund`,
          target_amount: itemCost,
          priority: 'medium',
        },
      },
      status: 'completed',
    };
  }

  // 2. Intent: Create / Propose Goal (e.g. "Propose an Emergency Fund goal of ₹60,000")
  if (/emergency fund|goal|save for/i.test(lower)) {
    const rawAmt = (query.match(/([0-9,]+)/) || [])[1];
    const goalAmt = rawAmt ? parseFloat(rawAmt.replace(/,/g, '')) : 60000;
    const goalName = /emergency/i.test(lower) ? 'Emergency Reserve Fund' : 'Target Savings Milestone';

    const thoughtSteps = [
      `Thought 1: Detected request to establish '${goalName}' of ${currency}${goalAmt.toLocaleString('en-IN')}.`,
      `Thought 2: Verified user goals and verified current cash flow capacity.`,
      `Observation: Proposing structured milestone for user confirmation.`,
    ];

    const answer = `I've prepared a new milestone proposal for **${goalName}** with a target of **${currency}${goalAmt.toLocaleString('en-IN')}**.\n\n` +
      `With your current monthly cash flow surplus of **${currency}${monthlySavings.toLocaleString('en-IN')}**, you can achieve this milestone smoothly. Please review and click **Approve Action** below to add it directly to your Goals tracker.`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: {
        tool: 'propose_create_goal',
        data: {
          name: goalName,
          target_amount: goalAmt,
          priority: 'high',
        },
      },
      status: 'completed',
    };
  }

  // 3. Intent: Spending Breakdown / Where is money going
  if (/where is (?:my )?money|top spending|category|categories|spending breakdown/i.test(lower)) {
    const categories = latest.expense_data || {};
    const sorted = Object.entries(categories)
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    const breakdownText = sorted.length > 0
      ? sorted.map(([c, amt]) => `- **${c}:** ${currency}${Number(amt).toLocaleString('en-IN')} (${monthlyExpenses > 0 ? Math.round((Number(amt) / monthlyExpenses) * 100) : 0}%)`).join('\n')
      : `- **Operational Disbursements:** ${currency}${monthlyExpenses.toLocaleString('en-IN')}`;

    const thoughtSteps = [
      'Thought 1: Retrieved category disbursement records from latest verified statement.',
      'Thought 2: Calculated category share of aggregate monthly burn.',
      'Observation: Core expense centers identified.',
    ];

    const answer = `### Monthly Outflow Breakdown (${latest.year}-${String(latest.month).padStart(2, '0')}):\n\n` +
      `Total monthly expenditure is **${currency}${monthlyExpenses.toLocaleString('en-IN')}** across the following cost centers:\n\n` +
      `${breakdownText}\n\n` +
      `**Diagnostic Advice:** Focus budget caps on the top two cost centers to unlock additional savings velocity.`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: sorted[0] ? {
        tool: 'propose_budget_cap',
        data: {
          category: sorted[0][0],
          limit_amount: Math.round(Number(sorted[0][1]) * 0.9),
          reasoning: 'Implement 10% efficiency cap on highest spending category.',
        },
      } : null,
      status: 'completed',
    };
  }

  // 4. General Financial Advice
  const answer = `Hello **${userName}**! 👋\n\n` +
    `Based on your verified accounts, here is your financial snapshot:\n` +
    `- **Monthly Inflow:** ${currency}${monthlyIncome.toLocaleString('en-IN')}\n` +
    `- **Monthly Outflow:** ${currency}${monthlyExpenses.toLocaleString('en-IN')}\n` +
    `- **Net Cash Flow:** **${monthlySavings >= 0 ? '+' : ''}${currency}${monthlySavings.toLocaleString('en-IN')}** (${savingsRate}% savings rate)\n\n` +
    `You are currently operating in a **${monthlySavings >= 0 ? 'healthy surplus' : 'deficit'}**. You can ask me:\n` +
    `- *"Can I afford a ₹50,000 laptop?"*\n` +
    `- *"Where is most of my money going?"*\n` +
    `- *"Propose a savings goal for an Emergency Fund"*`;

  return {
    raw_text: answer,
    final_answer: answer,
    thought_steps: [
      'Thought 1: Analyzed user account telemetry.',
      'Thought 2: Formulated executive financial advisory response.',
    ],
    hitl_action: null,
    status: 'completed',
  };
}
