"""ReAct (Reasoning + Acting) Agent Engine with Human-in-the-Loop (HITL) for FinGuide."""

from __future__ import annotations

import json
import re
from typing import Any

from .analyzer import build_financial_context
from .config import settings
from .gemini_client import get_gemini_client
from .guardrails import apply_post_guardrails, apply_pre_guardrails
from .schemas import Goal, Snapshot, Transaction


# Available tools for the ReAct agent
TOOLS_DEFINITION = """
You have access to the following financial tools:

1. `query_spending_summary(category: str = None)`
   - Computes total spending, breakdown, and frequency for a category or across all categories.

2. `simulate_savings_timeline(target_amount: float, monthly_contribution: float)`
   - Computes how many months it will take to reach a financial goal and the projected completion date.

3. `calculate_affordability(item_cost: float, down_payment: float = 0)`
   - Evaluates whether an expense is affordable given current monthly net savings and emergency fund status.

4. `propose_create_goal(name: str, target_amount: float, priority: str = "medium", deadline: str = None)`
   - [REQUIRES HUMAN APPROVAL] Proposes adding a new financial goal to the user's dashboard.

5. `propose_budget_cap(category: str, limit_amount: float, reasoning: str)`
   - [REQUIRES HUMAN APPROVAL] Proposes setting a spending cap on a specific expense category.

To use a tool, respond in this format:
Thought: <reasoning about what information is needed or what action to take>
Action: <tool_name>(<arguments in JSON format>)

When you receive the Observation, continue with:
Thought: <next reasoning step>
... (repeat Thought/Action/Observation if needed)

When you are ready to conclude, output your final answer:
Final Answer: <your advice to the user with actionable insights>
"""

REACT_SYSTEM_PROMPT = """You are FinGuide's Agentic Financial Planner running in a ReAct (Reasoning + Acting) loop.
Your role is to guide the user using real data and financial analysis tools.

{tools}

========================
HUMAN-IN-THE-LOOP (HITL) SAFETY RULES
========================
- You CANNOT directly modify user data (goals, budget limits) on your own.
- When proposing financial changes (e.g. creating a goal, setting a budget cap), you MUST use `propose_create_goal` or `propose_budget_cap`.
- The user will be prompted in the UI to explicitly APPROVE or REJECT the proposed action.
- Never promise guaranteed returns.
- Always communicate with clarity, empathy, and simplicity.
- Currency: {currency}
- User: {user_name}
"""


class ReActAgent:
    """ReAct execution loop for FinGuide."""

    def __init__(self) -> None:
        self.client = get_gemini_client()

    def run(
        self,
        user_message: str,
        *,
        user_name: str = "User",
        currency: str = "₹",
        snapshots: list[Snapshot] | None = None,
        transactions: list[Transaction] | None = None,
        goals: list[Goal] | None = None,
        max_iterations: int = 4,
    ) -> dict[str, Any]:
        """Execute the ReAct loop: Thought -> Action -> Observation -> Final Answer."""
        # 1. Pre-guardrail check
        guard_res = apply_pre_guardrails(user_message)
        if not guard_res.passed:
            rejection = guard_res.rejection_message or "Request blocked by safety guardrails."
            return {
                "thought_steps": ["Safety guardrail triggered."],
                "final_answer": apply_post_guardrails(rejection),
                "hitl_action": None,
                "status": "completed",
            }

        cleaned_query = guard_res.filtered_query

        # Build context
        context = build_financial_context(
            snapshots=snapshots,
            transactions=transactions,
            goals=goals,
            currency=currency,
        )

        system_instruction = REACT_SYSTEM_PROMPT.format(
            tools=TOOLS_DEFINITION,
            currency=currency,
            user_name=user_name,
        )

        conversation_history = (
            f"{system_instruction}\n\n"
            f"=== CURRENT USER FINANCIAL STATE ===\n{context}\n\n"
            f"User Question: {cleaned_query}\n"
        )

        thought_steps: list[str] = []
        pending_hitl_action: dict[str, Any] | None = None

        # Execute ReAct iteration steps
        for step in range(max_iterations):
            # Prompt the model for the next step
            prompt = conversation_history + "\nThought:"
            model_response = self.client.generate(
                prompt,
                user_name=user_name,
                currency=currency,
            )

            # Look for Action
            action_match = re.search(r"Action:\s*(\w+)\((.*?)\)", model_response, re.DOTALL)
            thought_text = model_response.split("Action:")[0].replace("Thought:", "").strip()
            if thought_text:
                thought_steps.append(thought_text)

            if not action_match:
                # If model finished with Final Answer or standard response
                final_answer_match = re.search(r"Final Answer:\s*(.*)", model_response, re.DOTALL)
                final_answer = final_answer_match.group(1).strip() if final_answer_match else model_response
                break

            tool_name = action_match.group(1).strip()
            args_raw = action_match.group(2).strip()

            # Parse tool arguments
            try:
                # Handle empty args or json
                args = json.loads(args_raw) if args_raw and args_raw != "" else {}
            except Exception:
                args = {}

            thought_steps.append(f"Invoking tool `{tool_name}` with {args}")

            # Handle HITL (Human-in-the-Loop) proposal actions
            if tool_name in ("propose_create_goal", "propose_budget_cap"):
                pending_hitl_action = {
                    "tool": tool_name,
                    "status": "pending_approval",
                    "requires_approval": True,
                    "data": args,
                    "summary": self._summarize_hitl_action(tool_name, args, currency),
                }
                observation = f"Action proposal created for user approval: {pending_hitl_action['summary']} (Waiting for user confirmation)."
            else:
                # Execute tool
                observation = self._execute_tool(
                    tool_name,
                    args,
                    snapshots=snapshots,
                    transactions=transactions,
                    goals=goals,
                    currency=currency,
                )

            thought_steps.append(f"Observation: {observation}")
            conversation_history += f"\nThought: {thought_text}\nAction: {tool_name}({args_raw})\nObservation: {observation}\n"

        else:
            # If reached max iterations, finalize response
            final_answer = self.client.generate(
                conversation_history + "\nPlease provide your Final Answer now:",
                user_name=user_name,
                currency=currency,
            )

        # Apply post guardrails (disclaimer & PII masking)
        safe_final_answer = apply_post_guardrails(final_answer)

        return {
            "thought_steps": thought_steps,
            "final_answer": safe_final_answer,
            "hitl_action": pending_hitl_action,
            "status": "pending_approval" if pending_hitl_action else "completed",
        }

    def _execute_tool(
        self,
        tool_name: str,
        args: dict[str, Any],
        *,
        snapshots: list[Snapshot] | None,
        transactions: list[Transaction] | None,
        goals: list[Goal] | None,
        currency: str,
    ) -> str:
        """Execute read-only calculation and inspection tools."""
        if tool_name == "query_spending_summary":
            target_cat = args.get("category", "").lower()
            if not transactions:
                return "No individual transactions recorded. Snapshot shows basic expenses."
            matching = [
                t for t in transactions
                if t.type == "expense" and (not target_cat or target_cat in (t.category or "").lower())
            ]
            total = sum(t.amount for t in matching)
            count = len(matching)
            return f"Found {count} expenses totaling {currency}{total:,.2f}."

        elif tool_name == "simulate_savings_timeline":
            target = float(args.get("target_amount", 0))
            monthly = float(args.get("monthly_contribution", 0))
            if monthly <= 0:
                return "Monthly contribution must be greater than 0 to reach the goal."
            months = round(target / monthly, 1)
            return f"At {currency}{monthly:,.2f}/month, achieving {currency}{target:,.2f} will take approximately {months} months."

        elif tool_name == "calculate_affordability":
            cost = float(args.get("item_cost", 0))
            monthly_savings = 0
            if snapshots and snapshots[0]:
                monthly_savings = snapshots[0].total_income - snapshots[0].total_expenses
            if monthly_savings <= 0:
                return f"Currently, monthly cash flow is tight ({currency}{monthly_savings:,.2f} surplus). Financing a {currency}{cost:,.2f} purchase requires freeing up savings first."
            months_needed = round(cost / monthly_savings, 1)
            return f"Based on your current monthly surplus of {currency}{monthly_savings:,.2f}, saving for {currency}{cost:,.2f} will take ~{months_needed} months without touching existing reserves."

        return f"Tool {tool_name} executed."

    def _summarize_hitl_action(self, tool_name: str, args: dict[str, Any], currency: str) -> str:
        """Create a human-friendly description for the confirmation UI."""
        if tool_name == "propose_create_goal":
            name = args.get("name", "New Goal")
            amt = args.get("target_amount", 0)
            deadline = args.get("deadline", "Flexible")
            return f"Create financial goal '{name}' with target {currency}{amt:,.2f} (Target Date: {deadline})"

        if tool_name == "propose_budget_cap":
            cat = args.get("category", "General")
            limit = args.get("limit_amount", 0)
            return f"Set a monthly spending limit of {currency}{limit:,.2f} on '{cat}'"

        return f"Apply proposed change: {args}"
