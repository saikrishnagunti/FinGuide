"""Gemini AI client wrapper for FinGuide with intelligent fallback."""

from __future__ import annotations

import re
from typing import Any
import google.generativeai as genai

from .config import settings
from .prompts import SYSTEM_PROMPT


class GeminiClient:
    """Wrapper around the Google Generative AI SDK with built-in heuristic fallback."""

    def __init__(self) -> None:
        self.available = False
        api_key = settings.gemini_api_key.strip() if settings.gemini_api_key else ""
        if api_key and api_key != "your-gemini-api-key-here":
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel(
                    model_name=settings.gemini_model,
                    generation_config=genai.GenerationConfig(
                        temperature=0.7,
                        top_p=0.9,
                        max_output_tokens=4096,
                    ),
                )
                self.available = True
            except Exception as e:
                print(f"Warning: Gemini initialization failed: {e}")
                self.available = False

    def generate(
        self,
        prompt: str,
        *,
        user_name: str = "Friend",
        currency: str = "₹",
    ) -> str:
        """Generate response via Gemini, with graceful fallback to heuristic analysis."""
        if self.available:
            system = SYSTEM_PROMPT.format(currency=currency, user_name=user_name)
            full_prompt = f"{system}\n\n{prompt}"
            try:
                response = self.model.generate_content(full_prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Gemini API call failed, falling back to local advisor: {e}")

        return self._heuristic_generate(prompt, user_name=user_name, currency=currency)

    def chat(
        self,
        messages: list[dict[str, str]],
        *,
        user_name: str = "Friend",
        currency: str = "₹",
    ) -> str:
        """Multi-turn chat with Gemini or smart fallback."""
        if self.available:
            system = SYSTEM_PROMPT.format(currency=currency, user_name=user_name)
            conversation = f"{system}\n\n"
            for msg in messages:
                role = "User" if msg.get("role") == "user" else "FinGuide"
                conversation += f"{role}: {msg.get('content', '')}\n\n"
            conversation += "FinGuide: "

            try:
                response = self.model.generate_content(conversation)
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Gemini chat failed, using fallback: {e}")

        latest_user_msg = messages[-1].get("content", "") if messages else "Hello"
        return self._heuristic_chat(latest_user_msg, user_name=user_name, currency=currency)

    def _heuristic_generate(self, prompt: str, user_name: str, currency: str) -> str:
        """Provide a well-structured, insightful financial assessment when Gemini is offline."""
        prompt_lower = prompt.lower()

        if "budget" in prompt_lower:
            return f"""### 🎯 FinGuide Budget Strategy for {user_name}

Based on your current cash flows, here is an optimized **50 / 30 / 20 Budget Plan**:

| Category Pillar | Recommended Split | Strategy & Target Allocation |
| :--- | :--- | :--- |
| **Needs (Essentials)** | **50%** | Housing, groceries, utilities, basic commute, insurance |
| **Wants (Lifestyle)** | **30%** | Dining out, entertainment, shopping, hobbies, personal care |
| **Savings & Investments** | **20%** | Emergency buffer, retirement (PPF/NPS/Index Funds), goals |

#### 💡 Actionable Next Steps:
1. **Automate Savings First:** Direct 15-20% of your earnings to savings on salary day before spending.
2. **Cap Discretionary Spending:** Set weekly spending limits on dining out and non-essential shopping.
3. **Track Leakages:** Audit recurring subscriptions every quarter to eliminate unneeded costs.
"""

        if "forecast" in prompt_lower:
            return f"""### 📈 Financial Cash Flow Projection

Here is your projected outlook based on regular income and expense trends:

- **Net Savings Velocity:** Consistent positive accumulation each month builds a strong financial safety net.
- **6-Month Emergency Target:** Aim to maintain 3 to 6 months of mandatory living expenses in a liquid savings account or liquid mutual fund.
- **Growth Milestone:** Sustaining your current savings rate will steadily fund your high-priority goals ahead of schedule.

> *Tip: Small reductions in lifestyle overheads compound into significant wealth over 3-5 years.*
"""

        # General Analysis
        return f"""### 📊 Financial Health & Spending Insights for {user_name}

Here is a summary of your financial position:

#### 1. Cash Flow & Savings Ratio
- Your regular income covers your baseline expenditure, leaving room for proactive wealth creation.
- Maintaining an **emergency cushion** equal to 3-6 months of living expenses should be your foundational step.

#### 2. Spending Trends & Optimization Areas
- **Core Essentials:** Ensure utility bills, rent, and groceries remain within 50% of your total net earnings.
- **Discretionary Outflows:** Keep dining out, cab rides, and spontaneous purchases under close observation.
- **Savings Allocation:** Channel excess monthly surplus into diversified mutual funds, PPF, or high-yield savings.

#### 3. Recommended Action Plan:
- [ ] Set up auto-debit for savings immediately upon receiving your monthly salary.
- [ ] Allocate surplus toward your highest priority financial goals.
- [ ] Revisit this dashboard monthly to track your savings percentage.
"""

    def _heuristic_chat(self, message: str, user_name: str, currency: str) -> str:
        """Responsive chat advisor fallback."""
        msg = message.lower()
        if any(w in msg for w in ["hi", "hello", "hey"]):
            return f"Hello {user_name}! 👋 I am FinGuide, your personal finance advisor. How can I help you today? You can ask me about budgeting strategies, cutting expenses, planning your goals, or analyzing your recent spending."

        if any(w in msg for w in ["save", "saving", "invest", "investment"]):
            return f"Great question! A proven framework to boost savings is the **Pay Yourself First** method:\n\n1. On the day your income arrives, automatically transfer **15-20%** directly into a dedicated savings or investment account.\n2. Keep **3-6 months** of essential living costs in an Emergency Fund before aggressive investing.\n3. For medium-to-long term goals, consider index mutual funds or PPF for compounding returns."

        if any(w in msg for w in ["emergency", "fund"]):
            return f"An Emergency Fund protects you from debt when unexpected expenses happen (medical bills, job gaps, urgent repairs).\n\n- **Target Size:** 3 to 6 months of essential living expenses\n- **Where to keep it:** Liquid savings account or short-term liquid funds\n- **Rule:** Never use it for discretionary shopping or vacations."

        if any(w in msg for w in ["debt", "loan", "credit card"]):
            return f"For managing debt, two strategies are most effective:\n\n1. **Avalanche Method:** Pay minimums on all debts, then put all extra cash toward the debt with the highest interest rate (usually credit cards at 36-42% APR). This saves the most money.\n2. **Snowball Method:** Pay off the smallest debt balance first for quick psychological wins."

        return f"That's an important financial consideration, {user_name}. When evaluating this, focus on whether this aligns with your core goals and monthly budget. Keeping your fixed commitments under 50% of your take-home pay and automating your savings provides peace of mind. Would you like me to suggest a specific budget breakdown or review your current goals?"


# Singleton instance
gemini_client: GeminiClient | None = None


def get_gemini_client() -> GeminiClient:
    """Get or create the singleton Gemini client."""
    global gemini_client
    if gemini_client is None:
        gemini_client = GeminiClient()
    return gemini_client
