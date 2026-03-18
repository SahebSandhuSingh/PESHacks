import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OLLAMA_MODEL = "llama3.2"
OLLAMA_BASE_URL = "http://127.0.0.1:11434"

SYSTEM_PROMPT = (
    "You are Dhadkan AI, an empathetic and clinically cautious digital twin assistant for PCOS/hormonal health. "
    "Be warm and concise. Use the provided patient context when relevant. "
    "Do not diagnose; encourage seeking professional care for severe symptoms or red flags."
)


def _format_context(health_context: dict[str, Any] | None) -> str:
    if not health_context:
        return "No recent health context available."

    lines: list[str] = []

    sensor = health_context.get("sensor", {}) or {}
    twin = health_context.get("twin", {}) or {}

    def add(label: str, val: Any, suffix: str = "") -> None:
        if val is None:
            return
        lines.append(f"- {label}: {val}{suffix}")

    add("Heart Rate", sensor.get("heart_rate"), " bpm")
    add("SpO2", sensor.get("spo2"), "%")
    add("Body Temp", sensor.get("ds18b20_temp"), " °C")
    add("Stress Index", twin.get("stress_index"))
    add("Sleep Stability", twin.get("sleep_stability"))
    add("Activity Score", twin.get("activity_score"))
    add("Temperature Rhythm", twin.get("temperature_cycle_stability"))
    add("Symptom Severity", twin.get("symptom_severity_index"))
    if twin.get("overall_hormonal_balance") is not None:
        lines.append(f"- Overall Balance: {twin.get('overall_hormonal_balance')}")

    if not lines:
        return "No recent health context available."

    return "\n".join(lines)


async def generate_chat_response(
    *,
    message: str,
    history: list[dict[str, str]] | None,
    health_context: dict[str, Any] | None,
) -> str:
    context_str = _format_context(health_context)

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": f"{SYSTEM_PROMPT}\n\nPatient context (for you only):\n{context_str}",
        }
    ]

    if history:
        for msg in history:
            role = msg.get("role")
            content = msg.get("content")
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            res.raise_for_status()
            data = res.json()
            return (data.get("message") or {}).get("content") or ""
    except Exception as exc:
        logger.exception("Ollama chat failed: %s", exc)
        return (
            "I couldn’t reach the local AI model. Please make sure Ollama is running and the model is pulled "
            f"(try `ollama pull {OLLAMA_MODEL}`)."
        )
