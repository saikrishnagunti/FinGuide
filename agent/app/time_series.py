"""Statistical Time Series Analysis and Forecasting Module.

Provides pure mathematical/statistical forecasting and rigorous comparative evaluation across:
- ETS (Exponential Smoothing / Holt-Winters)
- ARIMA (AutoRegressive Integrated Moving Average)
- SARIMA (Seasonal AutoRegressive Integrated Moving Average)

STRICT CONSTRAINT:
Does NOT depend on Gemini or any LLM. Pure statistical algorithms only.
Requires at least 12 months of historical data to produce 1 or 2 month forecasts.
Always evaluates all 3 candidate models on historical error (MAPE & RMSE) and selects the Best Fit.
"""

from __future__ import annotations

import logging
import math
import warnings
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX

warnings.filterwarnings("ignore")

logger = logging.getLogger("finguide.time_series")

MINIMUM_MONTHS_REQUIRED = 12
DEFAULT_DISCLAIMER = (
    "Disclaimer: Forecasts are generated using statistical time-series models "
    "(ARIMA / SARIMA / ETS) based purely on historical cash-flow trends. "
    "These projections are for informational budgeting guidance only and "
    "do not constitute financial advice. Actual results may differ."
)


def _advance_month(year_month: str, steps: int = 1) -> str:
    """Advance a 'YYYY-MM' string by `steps` months."""
    try:
        parts = year_month.split("-")
        year, month = int(parts[0]), int(parts[1])
        total_months = year * 12 + (month - 1) + steps
        new_year = total_months // 12
        new_month = (total_months % 12) + 1
        return f"{new_year:04d}-{new_month:02d}"
    except Exception:
        now = datetime.now()
        return f"{now.year:04d}-{now.month:02d}"


def _calc_mape(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Calculate Mean Absolute Percentage Error (MAPE)."""
    mask = actual > 1e-4
    if not np.any(mask):
        return 0.0
    errors = np.abs((actual[mask] - predicted[mask]) / actual[mask])
    return float(np.mean(errors) * 100.0)


def _calc_rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Calculate Root Mean Squared Error (RMSE)."""
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def _eval_ets(series: pd.Series, steps: int) -> dict[str, Any]:
    """Fit and evaluate Holt-Winters Exponential Smoothing model."""
    n = len(series)
    val = float(series.iloc[-1])

    if series.std() < 1e-4:
        return {
            "name": "Holt-Winters ETS (Constant)",
            "short_name": "ETS",
            "pred": np.full(steps, val),
            "lower": np.full(steps, max(0.0, val * 0.9)),
            "upper": np.full(steps, val * 1.1),
            "mape": 0.0,
            "rmse": 0.0,
        }

    try:
        if n >= 24:
            try:
                model = ExponentialSmoothing(
                    series,
                    trend="add",
                    damped_trend=True,
                    seasonal="add",
                    seasonal_periods=12,
                    initialization_method="estimated",
                )
                fit = model.fit()
                pred = np.maximum(0.0, np.array(fit.forecast(steps)))
                fitted = np.maximum(0.0, np.array(fit.fittedvalues))
                mape = _calc_mape(series.to_numpy(), fitted)
                rmse = _calc_rmse(series.to_numpy(), fitted)
                return {
                    "name": "Holt-Winters ETS (Seasonal 12M)",
                    "short_name": "ETS (Seasonal)",
                    "pred": pred,
                    "lower": np.maximum(0.0, pred * 0.9),
                    "upper": pred * 1.1,
                    "mape": round(mape, 2),
                    "rmse": round(rmse, 2),
                }
            except Exception:
                pass

        model = ExponentialSmoothing(
            series,
            trend="add",
            damped_trend=True,
            initialization_method="estimated",
        )
        fit = model.fit()
        pred = np.maximum(0.0, np.array(fit.forecast(steps)))
        fitted = np.maximum(0.0, np.array(fit.fittedvalues))
        mape = _calc_mape(series.to_numpy(), fitted)
        rmse = _calc_rmse(series.to_numpy(), fitted)
        return {
            "name": "Holt-Winters ETS (Damped Trend)",
            "short_name": "ETS",
            "pred": pred,
            "lower": np.maximum(0.0, pred * 0.9),
            "upper": pred * 1.1,
            "mape": round(mape, 2),
            "rmse": round(rmse, 2),
        }
    except Exception as e:
        logger.warning(f"ETS eval failed: {e}")
        pred = np.full(steps, val)
        return {
            "name": "Holt-Winters ETS (Fallback)",
            "short_name": "ETS",
            "pred": pred,
            "lower": pred * 0.85,
            "upper": pred * 1.15,
            "mape": 99.0,
            "rmse": 999999.0,
        }


def _eval_arima(series: pd.Series, steps: int) -> dict[str, Any]:
    """Fit and evaluate ARIMA model across candidate orders."""
    val = float(series.iloc[-1])
    if series.std() < 1e-4:
        return {
            "name": "ARIMA (Constant)",
            "short_name": "ARIMA",
            "pred": np.full(steps, val),
            "lower": np.full(steps, max(0.0, val * 0.9)),
            "upper": np.full(steps, val * 1.1),
            "mape": 0.0,
            "rmse": 0.0,
        }

    candidates = [(1, 1, 0), (0, 1, 1), (1, 1, 1), (1, 0, 0), (0, 1, 0)]
    best_aic = float("inf")
    best_res = None
    best_order = (1, 1, 0)

    for order in candidates:
        try:
            model = ARIMA(series, order=order)
            res = model.fit()
            if res.aic < best_aic:
                best_aic = res.aic
                best_res = res
                best_order = order
        except Exception:
            continue

    if best_res is not None:
        try:
            forecast_res = best_res.get_forecast(steps=steps)
            pred = np.maximum(0.0, forecast_res.predicted_mean.to_numpy())
            conf = forecast_res.conf_int(alpha=0.2).to_numpy()
            lower = np.maximum(0.0, conf[:, 0])
            upper = np.maximum(lower, conf[:, 1])

            # In-sample error
            fitted = np.maximum(0.0, best_res.fittedvalues.to_numpy())
            if len(fitted) > 1 and len(series) > 1:
                mape = _calc_mape(series.to_numpy()[1:], fitted[1:])
                rmse = _calc_rmse(series.to_numpy()[1:], fitted[1:])
            else:
                mape = _calc_mape(series.to_numpy(), fitted)
                rmse = _calc_rmse(series.to_numpy(), fitted)

            return {
                "name": f"ARIMA{best_order}",
                "short_name": "ARIMA",
                "pred": pred,
                "lower": lower,
                "upper": upper,
                "mape": round(mape, 2),
                "rmse": round(rmse, 2),
            }
        except Exception as e:
            logger.warning(f"ARIMA error extraction failed: {e}")

    # Fallback if ARIMA fails
    ets_eval = _eval_ets(series, steps)
    return {
        "name": "ARIMA (Fallback to ETS)",
        "short_name": "ARIMA",
        "pred": ets_eval["pred"],
        "lower": ets_eval["lower"],
        "upper": ets_eval["upper"],
        "mape": ets_eval["mape"],
        "rmse": ets_eval["rmse"],
    }


def _eval_sarima(series: pd.Series, steps: int) -> dict[str, Any]:
    """Fit and evaluate SARIMA model with 12-month seasonality."""
    val = float(series.iloc[-1])
    if series.std() < 1e-4:
        return {
            "name": "SARIMA (Constant)",
            "short_name": "SARIMA",
            "pred": np.full(steps, val),
            "lower": np.full(steps, max(0.0, val * 0.9)),
            "upper": np.full(steps, val * 1.1),
            "mape": 0.0,
            "rmse": 0.0,
        }

    try:
        model = SARIMAX(
            series,
            order=(1, 1, 0),
            seasonal_order=(1, 0, 0, 12),
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        res = model.fit(disp=False)
        forecast_res = res.get_forecast(steps=steps)
        pred = np.maximum(0.0, forecast_res.predicted_mean.to_numpy())
        conf = forecast_res.conf_int(alpha=0.2).to_numpy()
        lower = np.maximum(0.0, conf[:, 0])
        upper = np.maximum(lower, conf[:, 1])

        fitted = np.maximum(0.0, res.fittedvalues.to_numpy())
        if len(fitted) > 1 and len(series) > 1:
            mape = _calc_mape(series.to_numpy()[1:], fitted[1:])
            rmse = _calc_rmse(series.to_numpy()[1:], fitted[1:])
        else:
            mape = _calc_mape(series.to_numpy(), fitted)
            rmse = _calc_rmse(series.to_numpy(), fitted)

        return {
            "name": "SARIMA(1,1,0)(1,0,0,12)",
            "short_name": "SARIMA",
            "pred": pred,
            "lower": lower,
            "upper": upper,
            "mape": round(mape, 2),
            "rmse": round(rmse, 2),
        }
    except Exception as e:
        logger.info(f"SARIMA estimation fallback: {e}")
        arima_eval = _eval_arima(series, steps)
        return {
            "name": f"SARIMA (Fallback: {arima_eval['name']})",
            "short_name": "SARIMA",
            "pred": arima_eval["pred"],
            "lower": arima_eval["lower"],
            "upper": arima_eval["upper"],
            "mape": arima_eval["mape"],
            "rmse": arima_eval["rmse"],
        }


def _evaluate_series_models(series: pd.Series, steps: int) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """Evaluate ARIMA, SARIMA, and ETS on the series and pick the Best Fit."""
    ets_res = _eval_ets(series, steps)
    arima_res = _eval_arima(series, steps)
    sarima_res = _eval_sarima(series, steps)

    candidates = [ets_res, arima_res, sarima_res]
    # Sort by lowest MAPE (and RMSE as tiebreaker)
    candidates.sort(key=lambda c: (c.get("mape", 999.0), c.get("rmse", 999999.0)))

    evaluation_list = []
    for rank, cand in enumerate(candidates, start=1):
        is_best = (rank == 1)
        cand["rank"] = rank
        cand["is_best"] = is_best
        evaluation_list.append({
            "rank": rank,
            "name": cand["name"],
            "short_name": cand["short_name"],
            "mape": cand["mape"],
            "rmse": cand["rmse"],
            "is_best": is_best,
        })

    best_candidate = candidates[0]
    return best_candidate, evaluation_list


def analyze_and_forecast_timeseries(
    monthly_data: list[dict[str, Any]],
    months_ahead: int = 1,
    model_type: str = "best",
) -> dict[str, Any]:
    """Analyze monthly cash flow, evaluate ARIMA, SARIMA, ETS, and produce forecast.

    Args:
        monthly_data: List of dicts with 'month_key' (YYYY-MM), 'income', 'expenses'.
        months_ahead: 1 or 2 (strictly clamped).
        model_type: 'best' (or 'auto'), 'arima', 'sarima', or 'ets'.

    Returns:
        Structured forecast dictionary including comparative evaluations.
    """
    steps = max(1, min(2, int(months_ahead or 1)))
    model_type = (model_type or "best").strip().lower()
    # Normalize aliases: auto -> best
    if model_type in ["auto", "best_fit", "best fit"]:
        model_type = "best"

    clean_history = []
    for item in monthly_data:
        mkey = str(item.get("month_key") or "").strip()
        if not mkey:
            continue
        inc = float(item.get("income", 0.0) or 0.0)
        exp = float(item.get("expenses", 0.0) or 0.0)
        clean_history.append({
            "month_key": mkey,
            "income": round(inc, 2),
            "expenses": round(exp, 2),
            "savings": round(inc - exp, 2),
        })

    clean_history.sort(key=lambda x: x["month_key"])
    historical_count = len(clean_history)

    # 12-MONTH THRESHOLD CHECK (Strict User Requirement)
    if historical_count < MINIMUM_MONTHS_REQUIRED:
        return {
            "eligible": False,
            "historical_count": historical_count,
            "required_count": MINIMUM_MONTHS_REQUIRED,
            "months_ahead": steps,
            "model_used": "None",
            "best_model_name": "None",
            "evaluations": {},
            "history": clean_history,
            "forecast": [],
            "message": (
                f"Statistical time-series forecasting requires at least {MINIMUM_MONTHS_REQUIRED} months "
                f"of historical data to evaluate ARIMA, SARIMA, and ETS algorithms. "
                f"Currently available: {historical_count}/{MINIMUM_MONTHS_REQUIRED} months."
            ),
            "disclaimer": DEFAULT_DISCLAIMER,
        }

    income_series = pd.Series([x["income"] for x in clean_history], dtype=float)
    expense_series = pd.Series([x["expenses"] for x in clean_history], dtype=float)

    last_month_key = clean_history[-1]["month_key"]
    forecast_month_keys = [_advance_month(last_month_key, i + 1) for i in range(steps)]

    # ALWAYS evaluate all three models on Income and Expenses
    best_inc, inc_eval_list = _evaluate_series_models(income_series, steps)
    best_exp, exp_eval_list = _evaluate_series_models(expense_series, steps)

    evaluations_dict = {
        "income": inc_eval_list,
        "expenses": exp_eval_list,
        "best_income_model": best_inc["name"],
        "best_expenses_model": best_exp["name"],
        "best_income_mape": best_inc["mape"],
        "best_expenses_mape": best_exp["mape"],
    }

    # Select the model predictions based on user selection or Best Fit
    if model_type == "arima":
        inc_res = _eval_arima(income_series, steps)
        exp_res = _eval_arima(expense_series, steps)
        model_display = f"ARIMA (Income: {inc_res['name']} | Expenses: {exp_res['name']})"
        best_name = "ARIMA"
    elif model_type == "sarima":
        inc_res = _eval_sarima(income_series, steps)
        exp_res = _eval_sarima(expense_series, steps)
        model_display = f"SARIMA (Income: {inc_res['name']} | Expenses: {exp_res['name']})"
        best_name = "SARIMA"
    elif model_type == "ets":
        inc_res = _eval_ets(income_series, steps)
        exp_res = _eval_ets(expense_series, steps)
        model_display = f"Holt-Winters ETS (Income: {inc_res['name']} | Expenses: {exp_res['name']})"
        best_name = "Holt-Winters ETS"
    else:  # "best"
        inc_res = best_inc
        exp_res = best_exp
        model_display = f"Best Fit: Income: {inc_res['name']} ({inc_res['mape']}% err) | Expenses: {exp_res['name']} ({exp_res['mape']}% err)"
        best_name = f"Best Fit ({inc_res['short_name']} / {exp_res['short_name']})"

    inc_pred, inc_low, inc_high = inc_res["pred"], inc_res["lower"], inc_res["upper"]
    exp_pred, exp_low, exp_high = exp_res["pred"], exp_res["lower"], exp_res["upper"]

    forecast_items = []
    for i in range(steps):
        f_inc = round(float(inc_pred[i]), 2)
        f_exp = round(float(exp_pred[i]), 2)
        f_sav = round(f_inc - f_exp, 2)
        forecast_items.append({
            "month_key": forecast_month_keys[i],
            "income": f_inc,
            "expenses": f_exp,
            "savings": f_sav,
            "income_lower": round(float(inc_low[i]), 2),
            "income_upper": round(float(inc_high[i]), 2),
            "expenses_lower": round(float(exp_low[i]), 2),
            "expenses_upper": round(float(exp_high[i]), 2),
            "is_forecast": True,
        })

    return {
        "eligible": True,
        "historical_count": historical_count,
        "required_count": MINIMUM_MONTHS_REQUIRED,
        "months_ahead": steps,
        "model_used": model_display,
        "best_model_name": best_name,
        "evaluations": evaluations_dict,
        "history": clean_history,
        "forecast": forecast_items,
        "message": (
            f"Evaluated ARIMA, SARIMA, and ETS algorithms. Selected {model_display} "
            f"based on empirical minimum forecasting error."
        ),
        "disclaimer": DEFAULT_DISCLAIMER,
    }
