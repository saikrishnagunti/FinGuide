"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ─── Shared sub-models ────────────────────────────────────────────

class UserContext(BaseModel):
    name: str = "Guest"
    currency: str = "₹"
    is_logged_in: bool = False


class Snapshot(BaseModel):
    month: int | None = None
    year: int | None = None
    income_data: dict[str, Any] = Field(default_factory=dict)
    expense_data: dict[str, Any] = Field(default_factory=dict)
    total_income: float = 0
    total_expenses: float = 0
    net_savings: float = 0
    notes: str | None = None


class Transaction(BaseModel):
    id: int | None = None
    date: str = ""
    description: str = ""
    amount: float = 0
    type: str = "expense"  # 'income' or 'expense'
    category: str = "Uncategorized"
    source: str = "manual"


class Goal(BaseModel):
    id: int | None = None
    name: str = ""
    target_amount: float = 0
    current_amount: float = 0
    deadline: str | None = None
    priority: str = "medium"
    status: str = "active"


# ─── Request models ───────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    user_context: UserContext = Field(default_factory=UserContext)
    snapshots: list[Snapshot] = Field(default_factory=list)
    transactions: list[Transaction] = Field(default_factory=list)
    goals: list[Goal] = Field(default_factory=list)
    period: str = "current"
    query: str = "Provide a comprehensive financial analysis"


class ChatRequest(BaseModel):
    user_context: UserContext = Field(default_factory=UserContext)
    message: str
    conversation_history: list[dict[str, str]] = Field(default_factory=list)
    financial_data: dict[str, Any] = Field(default_factory=dict)


class BudgetRequest(BaseModel):
    user_context: UserContext = Field(default_factory=UserContext)
    snapshots: list[Snapshot] = Field(default_factory=list)
    transactions: list[Transaction] = Field(default_factory=list)
    goals: list[Goal] = Field(default_factory=list)


class ForecastRequest(BaseModel):
    snapshots: list[Snapshot] = Field(default_factory=list)
    transactions: list[Transaction] = Field(default_factory=list)
    months_ahead: int = 3


class TimeSeriesForecastRequest(BaseModel):
    history: list[dict[str, Any]] = Field(default_factory=list)
    months_ahead: int = 1
    model_type: str = "auto"  # 'auto', 'arima', 'sarima', 'ets'


class TimeSeriesForecastResponse(BaseModel):
    eligible: bool
    historical_count: int
    required_count: int = 12
    months_ahead: int = 1
    model_used: str = ""
    best_model_name: str = ""
    evaluations: dict[str, Any] = Field(default_factory=dict)
    history: list[dict[str, Any]] = Field(default_factory=list)
    forecast: list[dict[str, Any]] = Field(default_factory=list)
    message: str = ""
    disclaimer: str = ""


# ─── Response models ──────────────────────────────────────────────

class AgentResponse(BaseModel):
    """Standard response from the agent service."""

    summary: str = ""
    sections: list[dict[str, Any]] = Field(default_factory=list)
    insights: list[str] = Field(default_factory=list)
    raw_text: str = ""

