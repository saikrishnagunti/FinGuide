import config from '../config.js';

/**
 * Direct Gemini-powered Financial Advisor Service.
 * Provides deep, contextual, fiduciary-grade personal financial advice
 * grounded in real-time user financial telemetry.
 */
export async function runGeminiAdvisor({
  message = '',
  user = {},
  snapshots = [],
  transactions = [],
  goals = [],
  conversation_history = [],
}) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const currency = user?.currency || '₹';
  const userName = user?.name || 'Investor';

  // 1. Compute Financial Baseline from Verified Snapshots
  const latest = snapshots[0] || {};
  const monthlyIncome = Number(latest.total_income) || 0;
  const monthlyExpenses = Number(latest.total_expenses) || 0;
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;

  // 3-Month Rolling Average
  const slice = snapshots.slice(0, 3);
  const avgIncome = slice.length > 0
    ? Math.round(slice.reduce((s, r) => s + (Number(r.total_income) || 0), 0) / slice.length)
    : monthlyIncome;
  const avgExpenses = slice.length > 0
    ? Math.round(slice.reduce((s, r) => s + (Number(r.total_expenses) || 0), 0) / slice.length)
    : monthlyExpenses;

  // Category Breakdown
  const expenseData = latest.expense_data || {};
  const categories = Object.entries(expenseData)
    .map(([cat, amt]) => ({ cat, amt: Number(amt) || 0 }))
    .filter(c => c.amt > 0)
    .sort((a, b) => b.amt - a.amt);

  const topCatsText = categories.slice(0, 6)
    .map(c => `- ${c.cat}: ${currency}${c.amt.toLocaleString('en-IN')} (${monthlyExpenses > 0 ? Math.round((c.amt / monthlyExpenses) * 100) : 0}%)`)
    .join('\n');

  // Goals
  const activeGoals = (goals || []).filter(g => g.status === 'active');
  const goalsText = activeGoals.length > 0
    ? activeGoals.map(g => `- ${g.name}: Target ${currency}${Number(g.target_amount).toLocaleString('en-IN')}, Current ${currency}${Number(g.current_amount || 0).toLocaleString('en-IN')}`).join('\n')
    : 'No active goals recorded.';

  // Recent Transactions Sample
  const recentTxnsText = (transactions || []).slice(0, 8)
    .map(t => `- ${t.date || 'Recent'}: ${t.category || t.description} (${t.type}): ${currency}${Number(t.amount).toLocaleString('en-IN')}`)
    .join('\n');

  // Current Date Context
  const currentDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // 2. Build Fiduciary System Prompt
  const systemInstruction = `You are FinGuide AI, an elite fiduciary-grade personal financial advisor and wealth strategist.
Your task is to provide personalized, deeply contextual, data-grounded financial advice.

CORE RULES:
1. NEVER output generic boilerplate greetings like "You can ask me: Can I afford a laptop?". Address the user's specific context, question, or scenario directly and thoroughly.
2. Ground all calculations in the user's ACTUAL verified financial data below.
3. For FUTURE TIMELINES & PLANNING (e.g. "summer 2027", "next year", "in 6 months", "by retirement"):
   - Calculate the exact timeline (number of months between current date: ${currentDate} and the target date).
   - Project accumulated net cash flow surplus across that window.
   - Recommend prudent, actionable budget allocations (e.g. 30-45% for discretionary vacations/luxuries while preserving liquid emergency savings).
   - Break down a monthly contribution target to make the goal effortless.
4. For WHAT-IF SCENARIOS & BUDGETING:
   - Provide concrete trade-offs, potential expense optimizations from their actual top spend categories, and the exact dollar impacts.
5. If recommending a new financial goal or spending limit, you may optionally include a structured JSON block at the very end of your response for our Human-in-the-Loop approval system:
\`\`\`json
{
  "tool": "propose_create_goal",
  "summary": "Brief 1-sentence summary of proposed goal",
  "data": {
    "name": "Goal Title",
    "target_amount": 500000,
    "deadline": "YYYY-MM-DD",
    "priority": "medium"
  }
}
\`\`\`
or for budget caps:
\`\`\`json
{
  "tool": "propose_budget_cap",
  "summary": "Set monthly spending cap of ₹X on Category",
  "data": {
    "category": "Category Name",
    "limit_amount": 50000
  }
}
\`\`\`

USER FINANCIAL TELEMETRY:
- Name: ${userName}
- Currency: ${currency}
- Reference Month: ${currentDate}
- Monthly Inflow (Income): ${currency}${monthlyIncome.toLocaleString('en-IN')}
- Monthly Outflow (Expenses): ${currency}${monthlyExpenses.toLocaleString('en-IN')}
- Net Monthly Surplus: ${currency}${monthlySurplus.toLocaleString('en-IN')} (${savingsRate}% savings rate)
- 3-Month Rolling Average Surplus: ${currency}${(avgIncome - avgExpenses).toLocaleString('en-IN')}/mo
- Top Spending Categories:
${topCatsText || '- None recorded'}
- Active Goals:
${goalsText}
- Recent Account Activity:
${recentTxnsText || '- None recorded'}`;

  // 3. Assemble Conversation History
  const historyContents = [];
  if (Array.isArray(conversation_history) && conversation_history.length > 0) {
    for (const msg of conversation_history.slice(-8)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        historyContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }],
        });
      }
    }
  }

  const promptText = `${systemInstruction}\n\nUser Question: "${message}"`;
  const contents = [
    ...historyContents,
    { role: 'user', parts: [{ text: promptText }] },
  ];

  // 4. Query Gemini API with Fallback Models
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let geminiResponseText = '';
  let modelUsed = '';

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`[GeminiAdvisor] Model ${model} returned ${res.status}:`, errJson.error?.message || res.statusText);
        continue;
      }

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        geminiResponseText = data.candidates[0].content.parts[0].text;
        modelUsed = model;
        break;
      }
    } catch (modelErr) {
      console.warn(`[GeminiAdvisor] Error querying ${model}:`, modelErr.message);
    }
  }

  if (!geminiResponseText) {
    throw new Error('All Gemini AI model endpoints were busy or unavailable.');
  }

  // 5. Parse Human-In-The-Loop Action if present
  let hitlAction = null;
  let cleanText = geminiResponseText;

  const jsonBlockMatch = geminiResponseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  if (jsonBlockMatch) {
    try {
      const parsedAction = JSON.parse(jsonBlockMatch[1]);
      if (parsedAction.tool === 'propose_create_goal' || parsedAction.tool === 'propose_budget_cap') {
        hitlAction = parsedAction;
        // Clean out the raw JSON block from displayed markdown
        cleanText = geminiResponseText.replace(jsonBlockMatch[0], '').trim();
      }
    } catch (e) {
      console.warn('[GeminiAdvisor] Failed to parse HITL action JSON:', e.message);
    }
  }

  // 6. Generate 2-3 Structured Thought Reasoning Steps for ReAct transparency
  const thoughtSteps = [
    `Contextual Assessment: Analyzed inquiry across user baseline (Inflow: ${currency}${monthlyIncome.toLocaleString('en-IN')}, Net Surplus: ${currency}${monthlySurplus.toLocaleString('en-IN')}/mo).`,
    `Financial Evaluation: Modeled timeline, surplus velocity, and safe asset allocation trade-offs via ${modelUsed}.`,
    hitlAction ? `Action Formulation: Prepared Human-in-the-Loop milestone proposal for user review.` : `Strategic Formulation: Generated customized fiduciary guidance and savings milestones.`,
  ];

  return {
    raw_text: cleanText,
    final_answer: cleanText,
    thought_steps: thoughtSteps,
    hitl_action: hitlAction,
    status: 'completed',
    source: 'gemini_advisor',
    model: modelUsed,
  };
}
