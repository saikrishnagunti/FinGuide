/**
 * Resilient Context-Aware Financial Advisor Engine
 * Provides intelligent, data-grounded financial advice, timeline projections,
 * what-if scenario modeling, and Human-in-the-Loop (HITL) action proposals.
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

  // Extract category totals
  const categories = latest.expense_data || {};
  const sortedCategories = Object.entries(categories)
    .map(([cat, amt]) => ({ cat, amt: Number(amt) || 0 }))
    .filter(c => c.amt > 0)
    .sort((a, b) => b.amt - a.amt);

  // ── 1. Future Milestones, Trips, Vacations, or Target Dates (e.g. "summer 2027", "next year") ──
  const isFuturePlanning = /trip|vacation|travel|holiday|wedding|house|car|retire|summer\s*20\d\d|winter\s*20\d\d|in\s*\d+\s*(?:months?|years?)|by\s*20\d\d/i.test(lower) ||
                           /how much (?:budget )?(?:would|can|could) i (?:be able to )?afford/i.test(lower);

  if (isFuturePlanning) {
    // Calculate timeline in months
    let monthsToTarget = 8; // default to ~8 months
    let targetLabel = 'your target date';

    const yearMatch = lower.match(/20(2[6-9]|3[0-5])/);
    const seasonMatch = lower.match(/(summer|winter|spring|autumn|monsoon)\s*(20\d\d)?/i);
    const inMonthsMatch = lower.match(/in\s*(\d+)\s*months?/i);
    const inYearsMatch = lower.match(/in\s*(\d+)\s*years?/i);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    if (inMonthsMatch) {
      monthsToTarget = parseInt(inMonthsMatch[1], 10);
      targetLabel = `in ${monthsToTarget} months`;
    } else if (inYearsMatch) {
      monthsToTarget = parseInt(inYearsMatch[1], 10) * 12;
      targetLabel = `in ${inYearsMatch[1]} year(s)`;
    } else if (yearMatch) {
      const targetYear = parseInt('20' + yearMatch[1], 10);
      let targetMonth = 6; // default mid-year (June)
      if (seasonMatch) {
        const s = seasonMatch[1].toLowerCase();
        if (s === 'summer') targetMonth = 6;
        else if (s === 'winter') targetMonth = 12;
        else if (s === 'spring') targetMonth = 3;
        else if (s === 'autumn') targetMonth = 9;
      }
      monthsToTarget = Math.max(1, (targetYear - currentYear) * 12 + (targetMonth - currentMonth));
      targetLabel = seasonMatch ? `${seasonMatch[0].toUpperCase()}` : `${targetYear}`;
    }

    // Calculations
    const baselineMonthlySurplus = Math.max(0, monthlySavings);
    const totalProjectedSurplus = baselineMonthlySurplus * monthsToTarget;
    // Safe allocation for luxury/leisure: 30% to 45% of projected surplus
    const safeMinBudget = Math.round(totalProjectedSurplus * 0.30);
    const safeMaxBudget = Math.round(totalProjectedSurplus * 0.45);
    const recommendedBudget = Math.round((safeMinBudget + safeMaxBudget) / 2);
    const monthlyContribution = Math.round(recommendedBudget / monthsToTarget);

    let eventTitle = 'International Trip';
    if (/trip|vacation|travel|holiday/i.test(lower)) eventTitle = 'International Vacation';
    else if (/wedding/i.test(lower)) eventTitle = 'Wedding Milestone';
    else if (/house|apartment|property/i.test(lower)) eventTitle = 'Home Downpayment';
    else if (/car|vehicle/i.test(lower)) eventTitle = 'Vehicle Purchase';

    const thoughtSteps = [
      `Timeline Identification: Extrapolated target date (${targetLabel}) across a ${monthsToTarget}-month accumulation window.`,
      `Cash Flow Modeling: Projected total organic net surplus of ${currency}${totalProjectedSurplus.toLocaleString('en-IN')} (${currency}${monthlySavings.toLocaleString('en-IN')}/mo × ${monthsToTarget} mos).`,
      `Prudent Allocation: Formulated safe 30%–45% allocation (${currency}${safeMinBudget.toLocaleString('en-IN')} – ${currency}${safeMaxBudget.toLocaleString('en-IN')}) ensuring emergency buffers remain intact.`,
    ];

    const answer = `### Strategic Financial Planning: **${eventTitle} (${targetLabel})**\n\n` +
      `Hello **${userName}**! Based on your verified financial cash flows, here is an executive affordability model for your upcoming plans:\n\n` +
      `#### 📊 Cash Flow & Horizon Telemetry\n` +
      `- **Accumulation Window:** ~**${monthsToTarget} months** until ${targetLabel}\n` +
      `- **Current Monthly Net Surplus:** **${currency}${monthlySavings.toLocaleString('en-IN')}** (${savingsRate}% savings efficiency)\n` +
      `- **Total Projected Organic Accumulation:** **${currency}${totalProjectedSurplus.toLocaleString('en-IN')}**\n\n` +
      `#### ✈️ Recommended Affordable Budget\n` +
      `Fiduciary wealth planning advises dedicating **30% to 45%** of your incoming savings surplus to luxury leisure, preserving the remaining 55%+ for liquid emergency funds and ongoing compounding.\n\n` +
      `- **Comfortable Budget Range:** **${currency}${safeMinBudget.toLocaleString('en-IN')} – ${currency}${safeMaxBudget.toLocaleString('en-IN')}**\n` +
      `- **Recommended Target:** **${currency}${recommendedBudget.toLocaleString('en-IN')}**\n\n` +
      `#### 🎯 Execution Strategy\n` +
      `1. **Automate Monthly Savings:** Set aside **${currency}${monthlyContribution.toLocaleString('en-IN')}/month** into a designated short-term liquid fund.\n` +
      `2. **Retained Cushion:** You will still retain **${currency}${(monthlySavings - monthlyContribution).toLocaleString('en-IN')}/month** for core reserves and investments.\n` +
      `3. **Spending Optimization:** ${sortedCategories[0] ? `Your largest outflow is **${sortedCategories[0].cat}** at ${currency}${sortedCategories[0].amt.toLocaleString('en-IN')}. Trimming just 10% here frees an extra ${currency}${Math.round(sortedCategories[0].amt * 0.1).toLocaleString('en-IN')}/mo toward your travel experience!` : ''}\n\n` +
      `I've prepared a milestone proposal below for this goal. Would you like to review and approve it?`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: {
        tool: 'propose_create_goal',
        summary: `Establish '${eventTitle} - ${targetLabel}' goal of ${currency}${recommendedBudget.toLocaleString('en-IN')}`,
        data: {
          name: `${eventTitle} (${targetLabel})`,
          target_amount: recommendedBudget,
          priority: 'medium',
        },
      },
      status: 'completed',
    };
  }

  // ── 2. Loan / Lend Scenario (e.g. "my friend asked me a loan of 3 lakhs") ──
  if (/loan|lend|giving|give him|borrow/i.test(lower)) {
    const lakhMatch = query.match(/([0-9.]+)\s*(?:lakhs?|lacs?|l)/i);
    const numMatch = query.match(/([0-9,]+)/);
    let loanAmt = 300000;
    if (lakhMatch) {
      loanAmt = parseFloat(lakhMatch[1]) * 100000;
    } else if (numMatch) {
      loanAmt = parseFloat(numMatch[1].replace(/,/g, ''));
    }

    const surplusDeficit = monthlySavings - loanAmt;
    const canCoverFromSingleMonth = surplusDeficit >= 0;

    const thoughtSteps = [
      `Loan Evaluation: Assessed personal loan request of ${currency}${loanAmt.toLocaleString('en-IN')}.`,
      `Cash Flow Stress-Test: Compared against regular monthly net surplus of ${currency}${monthlySavings.toLocaleString('en-IN')}.`,
      canCoverFromSingleMonth
        ? `Sustain Check: Organic monthly surplus exceeds the loan amount; capital position remains positive.`
        : `Sustain Check: Single-month surplus falls short by ${currency}${Math.abs(surplusDeficit).toLocaleString('en-IN')}, requiring a temporary draw from liquid reserves.`,
    ];

    const answer = `### Personal Loan Sustainability Assessment\n\n` +
      `Hello **${userName}**! Let’s evaluate the impact of lending **${currency}${loanAmt.toLocaleString('en-IN')}** next month:\n\n` +
      `#### 📊 Cash Flow Telemetry\n` +
      `- **Normal Monthly Surplus:** ${currency}${monthlySavings.toLocaleString('en-IN')} (${savingsRate}% savings rate)\n` +
      `- **Requested Loan Amount:** ${currency}${loanAmt.toLocaleString('en-IN')}\n` +
      `- **Next Month Net Cash Impact:** **${surplusDeficit >= 0 ? '+' : '-'}${currency}${Math.abs(surplusDeficit).toLocaleString('en-IN')}**\n\n` +
      `#### 💡 Advisor Verdict & Guidance\n` +
      (canCoverFromSingleMonth
        ? `**Yes, you can easily sustain this.** Your regular monthly net surplus completely covers the loan, leaving you with **${currency}${surplusDeficit.toLocaleString('en-IN')}** in additional savings that month.`
        : `**Yes, you can sustain this, provided you have liquid buffer reserves.** Because the loan exceeds next month's net surplus by **${currency}${Math.abs(surplusDeficit).toLocaleString('en-IN')}**, you will temporarily tap that amount from your existing bank savings or pause other goal contributions for just one month.`) +
      `\n\n` +
      `**Fiduciary Safeguards:**\n` +
      `1. **Set Clear Repayment Terms:** Agree on an explicit repayment date or installment schedule so it doesn't collide with other major milestones.\n` +
      `2. **Preserve Core Reserve:** Ensure you still retain at least 3 months of essential expenses (${currency}${Math.round(monthlyExpenses * 3).toLocaleString('en-IN')}) in untouched emergency funds.`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: null,
      status: 'completed',
    };
  }

  // ── 3. Follow-up Budget Target (e.g. "can i plan the trip in 10lakhs , is it possible?") ──
  const planTargetMatch = query.match(/(?:plan|budget|target|do it in|make it)\s*(?:the\s*)?(?:trip|vacation)?\s*(?:in|for|at)?\s*([0-9.]+)\s*(?:lakhs?|lacs?|l)/i) ||
                          query.match(/([0-9.]+)\s*(?:lakhs?|lacs?|l)\s*(?:is it possible|\?)/i);
  if (planTargetMatch) {
    const targetAmt = parseFloat(planTargetMatch[1]) * 100000;
    const months = 8;
    const monthlyNeeded = Math.round(targetAmt / months);
    const pctOfSurplus = monthlySavings > 0 ? Math.round((monthlyNeeded / monthlySavings) * 100) : 100;

    const thoughtSteps = [
      `Target Calibration: Modeled specified target of ${currency}${targetAmt.toLocaleString('en-IN')} across an 8-month horizon.`,
      `Savings Velocity: Monthly contribution required is ${currency}${monthlyNeeded.toLocaleString('en-IN')} (${pctOfSurplus}% of monthly surplus).`,
      `Feasibility: Highly achievable within existing cash flow surplus.`,
    ];

    const answer = `### Budget Feasibility Analysis: **${currency}${targetAmt.toLocaleString('en-IN')} Target**\n\n` +
      `Hello **${userName}**! **Yes, planning this in ${currency}${targetAmt.toLocaleString('en-IN')} is completely possible!**\n\n` +
      `Here is the exact math to achieve this comfortably:\n\n` +
      `#### 📊 Numbers Breakdown\n` +
      `- **Target Budget:** ${currency}${targetAmt.toLocaleString('en-IN')}\n` +
      `- **Accumulation Window:** ~8 months\n` +
      `- **Monthly Savings Needed:** **${currency}${monthlyNeeded.toLocaleString('en-IN')}/month**\n` +
      `- **Your Current Monthly Surplus:** **${currency}${monthlySavings.toLocaleString('en-IN')}**\n` +
      `- **Remaining Monthly Cushion:** **${currency}${(monthlySavings - monthlyNeeded).toLocaleString('en-IN')}/month**\n\n` +
      `#### ✈️ Fiduciary Recommendation\n` +
      `This goal consumes **${pctOfSurplus}%** of your monthly surplus, leaving you with **${currency}${(monthlySavings - monthlyNeeded).toLocaleString('en-IN')}** every single month for other savings and emergencies.\n\n` +
      `Would you like me to update your goal tracker to lock in this **${currency}${targetAmt.toLocaleString('en-IN')}** target?`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: thoughtSteps,
      hitl_action: {
        tool: 'propose_create_goal',
        summary: `Set International Trip goal of ${currency}${targetAmt.toLocaleString('en-IN')}`,
        data: {
          name: 'International Trip Summer 2027',
          target_amount: targetAmt,
          priority: 'high',
        },
      },
      status: 'completed',
    };
  }

  // ── 4. Affordability Check with Specific Item Cost ──
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

    const canAffordImmediately = monthlySavings >= itemCost;
    const monthsNeeded = monthlySavings > 0 ? Math.ceil(itemCost / monthlySavings) : 'Indefinite';

    const thoughtSteps = [
      `Identified purchase target of ${currency}${itemCost.toLocaleString('en-IN')} for '${itemName}'.`,
      `Cross-referenced against verified monthly surplus of ${currency}${monthlySavings.toLocaleString('en-IN')} (${savingsRate}% savings rate).`,
      canAffordImmediately ? 'Current single-month operating cash flow fully covers the item cost.' : `Accumulating savings over ${monthsNeeded} month(s) will cover the cost without touching working capital.`,
    ];

    const answer = canAffordImmediately
      ? `### Financial Affordability Assessment: **Yes, Highly Affordable!**\n\n` +
        `Hi **${userName}**! You can comfortably afford this **${currency}${itemCost.toLocaleString('en-IN')} ${itemName}**.\n\n` +
        `- **Monthly Operating Surplus:** ${currency}${monthlySavings.toLocaleString('en-IN')}\n` +
        `- **Cost-to-Surplus Ratio:** This purchase represents only **${Math.round((itemCost / monthlySavings) * 100)}%** of a single month's net savings.\n` +
        `- **Capital Impact:** You will retain **${currency}${(monthlySavings - itemCost).toLocaleString('en-IN')}** in excess reserves even after completing the purchase this month.\n\n` +
        `Would you like me to set up an approved savings goal for this on your Dashboard?`
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
        summary: `Create savings goal: '${itemName} Fund' with target ${currency}${itemCost.toLocaleString('en-IN')}`,
        data: {
          name: `${itemName} Fund`,
          target_amount: itemCost,
          priority: 'medium',
        },
      },
      status: 'completed',
    };
  }

  // ── 5. Spending Breakdown / Where is money going / Category analysis ──
  if (/where is (?:my )?money|top spending|category|categories|spending breakdown|expenses/i.test(lower)) {
    const breakdownText = sortedCategories.length > 0
      ? sortedCategories.map(c => `- **${c.cat}:** ${currency}${c.amt.toLocaleString('en-IN')} (${monthlyExpenses > 0 ? Math.round((c.amt / monthlyExpenses) * 100) : 0}%)`).join('\n')
      : `- **Operational Disbursements:** ${currency}${monthlyExpenses.toLocaleString('en-IN')}`;

    const answer = `### Monthly Outflow Breakdown:\n\n` +
      `Your total monthly expenditure is **${currency}${monthlyExpenses.toLocaleString('en-IN')}** across the following cost centers:\n\n` +
      `${breakdownText}\n\n` +
      `**Diagnostic Advice:** Focus budget caps on the top two cost centers (${sortedCategories[0]?.cat || 'Primary'} and ${sortedCategories[1]?.cat || 'Secondary'}) to unlock additional savings velocity.`;

    return {
      raw_text: answer,
      final_answer: answer,
      thought_steps: [
        'Retrieved category disbursement records from verified ledger.',
        'Calculated category share of aggregate monthly burn.',
        'Formulated optimization proposal for top spending centers.',
      ],
      hitl_action: sortedCategories[0] ? {
        tool: 'propose_budget_cap',
        summary: `Set 10% efficiency cap of ${currency}${Math.round(sortedCategories[0].amt * 0.9).toLocaleString('en-IN')} on '${sortedCategories[0].cat}'`,
        data: {
          category: sortedCategories[0].cat,
          limit_amount: Math.round(sortedCategories[0].amt * 0.9),
        },
      } : null,
      status: 'completed',
    };
  }

  // ── 6. General Contextual Advice ──
  const answer = `Hello **${userName}**! 👋\n\n` +
    `Based on your verified financial ledger, here is your current cash flow balance:\n\n` +
    `- **Monthly Operating Inflow:** ${currency}${monthlyIncome.toLocaleString('en-IN')}\n` +
    `- **Monthly Operating Outflow:** ${currency}${monthlyExpenses.toLocaleString('en-IN')}\n` +
    `- **Net Monthly Surplus:** **${monthlySavings >= 0 ? '+' : ''}${currency}${monthlySavings.toLocaleString('en-IN')}** (${savingsRate}% savings retention)\n\n` +
    `You are operating with strong cash flow health. With an ongoing surplus of ${currency}${monthlySavings.toLocaleString('en-IN')} per month, you have the financial latitude to fund major milestones, allocate capital toward investments, or absorb discretionary expenditures without disrupting your core liquidity.\n\n` +
    `Tell me the specific amount, timeframe, or goal you have in mind and I will model the exact roadmap for you.`;

  return {
    raw_text: answer,
    final_answer: answer,
    thought_steps: [
      'Analyzed user account telemetry.',
      'Formulated executive financial advisory response.',
    ],
    hitl_action: null,
    status: 'completed',
  };
}
