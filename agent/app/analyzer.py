"""Financial data analyzer — prepares context for Gemini prompts."""

from __future__ import annotations

from typing import Any

from .schemas import Snapshot, Transaction, Goal


def build_financial_context(
    snapshots: list[Snapshot] | None = None,
    transactions: list[Transaction] | None = None,
    goals: list[Goal] | None = None,
    currency: str = "₹",
) -> str:
    """Build a concise text summary of financial data for LLM context."""
    parts: list[str] = []

    # ── Snapshots (I&E summaries) ──
    if snapshots:
        parts.append("=== Income & Expense Snapshots ===")
        for s in snapshots:
            month_label = f"{s.year}-{s.month:02d}" if s.month and s.year else "Current"
            parts.append(f"\n--- {month_label} ---")

            if s.income_data:
                parts.append("Income:")
                for src, amt in s.income_data.items():
                    parts.append(f"  {src}: {currency}{_fmt(amt)}")
                parts.append(f"  Total Income: {currency}{_fmt(s.total_income)}")

            if s.expense_data:
                parts.append("Expenses:")
                for cat, amt in s.expense_data.items():
                    parts.append(f"  {cat}: {currency}{_fmt(amt)}")
                parts.append(f"  Total Expenses: {currency}{_fmt(s.total_expenses)}")

            net = s.total_income - s.total_expenses
            rate = (net / s.total_income * 100) if s.total_income > 0 else 0
            parts.append(f"  Net Savings: {currency}{_fmt(net)}")
            parts.append(f"  Savings Rate: {rate:.1f}%")

    # ── Transactions ──
    if transactions:
        parts.append("\n=== Recent Transactions ===")

        # Group by category for summary
        by_category: dict[str, dict[str, Any]] = {}
        for t in transactions:
            cat = t.category or "Uncategorized"
            if cat not in by_category:
                by_category[cat] = {"total": 0, "count": 0, "type": t.type}
            by_category[cat]["total"] += t.amount
            by_category[cat]["count"] += 1

        parts.append(f"Total transactions: {len(transactions)}")
        parts.append("\nSpending by category:")
        sorted_cats = sorted(by_category.items(), key=lambda x: x[1]["total"], reverse=True)
        for cat, data in sorted_cats:
            parts.append(
                f"  {cat}: {currency}{_fmt(data['total'])} "
                f"({data['count']} txns, {data['type']})"
            )

        # Also show the latest few transactions
        parts.append("\nLatest transactions:")
        for t in transactions[:10]:
            sign = "+" if t.type == "income" else "-"
            parts.append(
                f"  {t.date} | {sign}{currency}{_fmt(t.amount)} | "
                f"{t.description} [{t.category}]"
            )
        if len(transactions) > 10:
            parts.append(f"  ... and {len(transactions) - 10} more")

    # ── Goals ──
    if goals:
        parts.append("\n=== Financial Goals ===")
        for g in goals:
            progress = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
            deadline = f" (by {g.deadline})" if g.deadline else ""
            parts.append(
                f"  {g.name}: {currency}{_fmt(g.current_amount)} / "
                f"{currency}{_fmt(g.target_amount)} ({progress:.0f}%){deadline} "
                f"[{g.priority} priority]"
            )

    return "\n".join(parts) if parts else "No financial data available."


def compute_quick_stats(
    snapshots: list[Snapshot] | None = None,
    transactions: list[Transaction] | None = None,
) -> dict[str, Any]:
    """Compute quick statistics from raw data for the frontend."""
    stats: dict[str, Any] = {
        "total_income": 0,
        "total_expenses": 0,
        "net_savings": 0,
        "savings_rate": 0,
        "top_categories": [],
        "monthly_trend": [],
    }

    if snapshots:
        latest = snapshots[0]
        stats["total_income"] = latest.total_income
        stats["total_expenses"] = latest.total_expenses
        stats["net_savings"] = latest.total_income - latest.total_expenses
        if latest.total_income > 0:
            stats["savings_rate"] = round(
                (latest.total_income - latest.total_expenses) / latest.total_income * 100, 1
            )

        # Monthly trend from snapshots
        stats["monthly_trend"] = [
            {
                "month": f"{s.year}-{s.month:02d}" if s.month and s.year else "N/A",
                "income": s.total_income,
                "expenses": s.total_expenses,
                "savings": s.total_income - s.total_expenses,
            }
            for s in reversed(snapshots)
        ]

    if transactions:
        # Top expense categories
        cat_totals: dict[str, float] = {}
        for t in transactions:
            if t.type == "expense":
                cat = t.category or "Uncategorized"
                cat_totals[cat] = cat_totals.get(cat, 0) + t.amount

        sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
        total_exp = sum(v for _, v in sorted_cats)

        stats["top_categories"] = [
            {
                "category": cat,
                "amount": round(amt, 2),
                "percentage": round(amt / total_exp * 100, 1) if total_exp > 0 else 0,
            }
            for cat, amt in sorted_cats[:8]
        ]

        # If we don't have snapshot data, compute from transactions
        if not snapshots:
            income = sum(t.amount for t in transactions if t.type == "income")
            expenses = sum(t.amount for t in transactions if t.type == "expense")
            stats["total_income"] = income
            stats["total_expenses"] = expenses
            stats["net_savings"] = income - expenses
            if income > 0:
                stats["savings_rate"] = round((income - expenses) / income * 100, 1)

    # If top_categories is still empty but snapshots exist, compute from latest snapshot's expense_data
    if not stats["top_categories"] and snapshots:
        latest = snapshots[0]
        if latest.expense_data:
            exp_items = []
            for cat, amt in latest.expense_data.items():
                try:
                    val = float(amt or 0)
                    if val > 0:
                        clean_cat = str(cat).replace("_", " ").title()
                        exp_items.append((clean_cat, val))
                except (ValueError, TypeError):
                    pass
            sorted_exp = sorted(exp_items, key=lambda x: x[1], reverse=True)
            total_exp = sum(v for _, v in sorted_exp)
            stats["top_categories"] = [
                {
                    "category": cat,
                    "amount": round(amt, 2),
                    "percentage": round(amt / total_exp * 100, 1) if total_exp > 0 else 0,
                }
                for cat, amt in sorted_exp[:8]
            ]

    return stats


def _fmt(value: Any) -> str:
    """Format a number with commas (Indian numbering style)."""
    try:
        num = float(value)
        if num == int(num):
            return f"{int(num):,}"
        return f"{num:,.2f}"
    except (ValueError, TypeError):
        return str(value)
