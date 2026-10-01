"""FastAPI application for the FinGuide AI agent service."""

from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .analyzer import build_financial_context, compute_quick_stats
from .gemini_client import get_gemini_client
from .guardrails import apply_post_guardrails, apply_pre_guardrails
from .pdf_parser import parse_statement_with_pdfplumber
from .prompts import (
    ANALYSIS_PROMPT,
    BUDGET_PROMPT,
    CHAT_PROMPT,
    FORECAST_PROMPT,
    GUEST_ANALYSIS_PROMPT,
)
from .react_agent import ReActAgent
from .schemas import (
    AgentResponse,
    AnalyzeRequest,
    BudgetRequest,
    ChatRequest,
    ForecastRequest,
    TimeSeriesForecastRequest,
    TimeSeriesForecastResponse,
)
from .time_series import analyze_and_forecast_timeseries

app = FastAPI(
    title="FinGuide Agent Service",
    description="AI-powered financial analysis agent using Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "finguide-agent"}


from pydantic import BaseModel


class ParsePdfRequest(BaseModel):
    file_base64: str
    filename: str = "statement.pdf"


@app.post("/parse-pdf")
async def parse_pdf(request: ParsePdfRequest):
    """Parse bank statement PDF directly into structured transactions without RAG."""
    try:
        import asyncio
        import base64

        pdf_bytes = base64.b64decode(request.file_base64)
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Empty PDF file received")
        print(f"[Agent] /parse-pdf received {request.filename}, {len(pdf_bytes)} bytes")
        result = await asyncio.to_thread(parse_statement_with_pdfplumber, pdf_bytes)
        print(f"[Agent] /parse-pdf finished, found {result.get('count', 0)} transactions")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze", response_model=AgentResponse)
async def analyze(request: AnalyzeRequest):
    """Run comprehensive financial analysis using Gemini with safety guardrails."""
    try:
        # Pre-guardrail check
        guard_res = apply_pre_guardrails(request.query)
        if not guard_res.passed:
            rejection = guard_res.rejection_message or "Request declined due to safety guidelines."
            return AgentResponse(
                summary="Educational Safety Advisory",
                sections=[{"title": "Advisory Notice", "content": rejection}],
                insights=[],
                raw_text=apply_post_guardrails(rejection),
            )

        client = get_gemini_client()

        context = build_financial_context(
            snapshots=request.snapshots,
            transactions=request.transactions,
            goals=request.goals,
            currency=request.user_context.currency,
        )

        if not request.user_context.is_logged_in:
            prompt = GUEST_ANALYSIS_PROMPT.format(
                context=context,
                query=guard_res.filtered_query,
                currency=request.user_context.currency,
            )
        else:
            prompt = ANALYSIS_PROMPT.format(
                context=context,
                query=guard_res.filtered_query,
                currency=request.user_context.currency,
            )

        raw_text = client.generate(
            prompt,
            user_name=request.user_context.name,
            currency=request.user_context.currency,
        )

        raw_text = apply_post_guardrails(raw_text)

        stats = compute_quick_stats(
            snapshots=request.snapshots,
            transactions=request.transactions,
        )

        return AgentResponse(
            summary=_extract_summary(raw_text),
            sections=[
                {"title": "Quick Stats", "data": stats},
                {"title": "AI Analysis", "content": raw_text},
            ],
            insights=_extract_insights(raw_text),
            raw_text=raw_text,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=AgentResponse)
async def chat(request: ChatRequest):
    """Chat with the AI financial advisor with safety guardrails."""
    try:
        # Pre-guardrail check
        guard_res = apply_pre_guardrails(request.message)
        if not guard_res.passed:
            rejection = guard_res.rejection_message or "Request declined due to safety guidelines."
            return AgentResponse(
                summary="",
                sections=[],
                insights=[],
                raw_text=apply_post_guardrails(rejection),
            )

        client = get_gemini_client()

        # Build financial context from available data
        financial_data = request.financial_data
        snapshots_raw = financial_data.get("snapshots", [])
        transactions_raw = financial_data.get("transactions", [])
        goals_raw = financial_data.get("goals", [])

        from .schemas import Goal, Snapshot, Transaction

        snapshots = [Snapshot(**s) if isinstance(s, dict) else s for s in snapshots_raw]
        transactions = [Transaction(**t) if isinstance(t, dict) else t for t in transactions_raw]
        goals = [Goal(**g) if isinstance(g, dict) else g for g in goals_raw]

        context = build_financial_context(
            snapshots=snapshots,
            transactions=transactions,
            goals=goals,
            currency=request.user_context.currency,
        )

        # Build conversation history
        history_lines: list[str] = []
        for msg in request.conversation_history:
            role = "User" if msg.get("role") == "user" else "FinGuide"
            history_lines.append(f"{role}: {msg.get('content', '')}")

        history_text = "\n".join(history_lines) if history_lines else "(New conversation)"

        prompt = CHAT_PROMPT.format(
            context=context,
            history=history_text,
            message=guard_res.filtered_query,
            currency=request.user_context.currency,
        )

        raw_text = client.generate(
            prompt,
            user_name=request.user_context.name,
            currency=request.user_context.currency,
        )

        raw_text = apply_post_guardrails(raw_text)

        return AgentResponse(
            summary="",
            sections=[],
            insights=[],
            raw_text=raw_text,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/react")
async def react_agent_chat(request: ChatRequest):
    """Run an agentic ReAct loop with tool execution and HITL proposals."""
    try:
        financial_data = request.financial_data
        snapshots_raw = financial_data.get("snapshots", [])
        transactions_raw = financial_data.get("transactions", [])
        goals_raw = financial_data.get("goals", [])

        from .schemas import Goal, Snapshot, Transaction

        snapshots = [Snapshot(**s) if isinstance(s, dict) else s for s in snapshots_raw]
        transactions = [Transaction(**t) if isinstance(t, dict) else t for t in transactions_raw]
        goals = [Goal(**g) if isinstance(g, dict) else g for g in goals_raw]

        agent = ReActAgent()
        result = agent.run(
            request.message,
            user_name=request.user_context.name,
            currency=request.user_context.currency,
            snapshots=snapshots,
            transactions=transactions,
            goals=goals,
        )

        return {
            "summary": "Agentic Reasoning with Tool Execution",
            "thought_steps": result.get("thought_steps", []),
            "raw_text": result.get("final_answer", ""),
            "hitl_action": result.get("hitl_action"),
            "status": result.get("status", "completed"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/budget", response_model=AgentResponse)
async def propose_budget(request: BudgetRequest):
    """Generate an AI-powered budget proposal."""
    try:
        client = get_gemini_client()

        context = build_financial_context(
            snapshots=request.snapshots,
            transactions=request.transactions,
            goals=request.goals,
            currency=request.user_context.currency,
        )

        prompt = BUDGET_PROMPT.format(
            context=context,
            currency=request.user_context.currency,
        )

        raw_text = client.generate(
            prompt,
            user_name=request.user_context.name,
            currency=request.user_context.currency,
        )

        raw_text = apply_post_guardrails(raw_text)

        return AgentResponse(
            summary="Budget proposal based on your spending patterns",
            sections=[{"title": "Budget Proposal", "content": raw_text}],
            insights=_extract_insights(raw_text),
            raw_text=raw_text,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast", response_model=AgentResponse)
async def forecast(request: ForecastRequest):
    """Generate a cash flow forecast."""
    try:
        client = get_gemini_client()

        context = build_financial_context(
            snapshots=request.snapshots,
            transactions=request.transactions,
        )

        prompt = FORECAST_PROMPT.format(
            context=context,
            months_ahead=request.months_ahead,
            currency="₹",
        )

        raw_text = client.generate(prompt)
        raw_text = apply_post_guardrails(raw_text)

        return AgentResponse(
            summary=f"Financial forecast for the next {request.months_ahead} months",
            sections=[{"title": "Forecast", "content": raw_text}],
            insights=_extract_insights(raw_text),
            raw_text=raw_text,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/time-series-forecast", response_model=TimeSeriesForecastResponse)
async def time_series_forecast(request: TimeSeriesForecastRequest):
    """Generate statistical time series forecast (ARIMA/SARIMA/ETS) without Gemini/LLM dependency.
    Requires at least 12 months of historical data to produce 1 or 2 month forecasts.
    """
    try:
        result = analyze_and_forecast_timeseries(
            monthly_data=request.history,
            months_ahead=request.months_ahead,
            model_type=request.model_type,
        )
        return TimeSeriesForecastResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Time series analysis failed: {str(e)}")


# ─── Helpers ───────────────────────────────────────────────────────


def _extract_summary(text: str) -> str:
    """Extract the first paragraph or summary section from AI output."""
    lines = text.strip().split("\n")
    summary_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if summary_lines:
                break
            continue
        # Skip markdown headings for the summary
        if stripped.startswith("#"):
            if summary_lines:
                break
            continue
        summary_lines.append(stripped)
        if len(summary_lines) >= 3:
            break
    return " ".join(summary_lines) if summary_lines else text[:200]


def _extract_insights(text: str) -> list[str]:
    """Extract bullet-point insights from AI output."""
    insights: list[str] = []
    in_insights_section = False

    for line in text.split("\n"):
        stripped = line.strip()

        # Detect insight/recommendation sections
        lower = stripped.lower()
        if any(
            kw in lower
            for kw in ["insight", "recommendation", "action", "tip", "suggestion"]
        ):
            in_insights_section = True
            continue

        # Detect end of section
        if stripped.startswith("#") and in_insights_section:
            in_insights_section = False
            continue

        # Collect bullet points
        if in_insights_section and (
            stripped.startswith("- ")
            or stripped.startswith("• ")
            or stripped.startswith("* ")
            or (len(stripped) > 2 and stripped[0].isdigit() and stripped[1] in ".)")
        ):
            # Clean up the bullet
            clean = stripped.lstrip("-•* ").lstrip("0123456789.)").strip()
            if clean:
                insights.append(clean)

    # If we couldn't extract structured insights, take the first few bullet points
    if not insights:
        for line in text.split("\n"):
            stripped = line.strip()
            if stripped.startswith("- ") or stripped.startswith("• "):
                clean = stripped.lstrip("-• ").strip()
                if clean and len(clean) > 10:
                    insights.append(clean)
                    if len(insights) >= 5:
                        break

    return insights[:5]
