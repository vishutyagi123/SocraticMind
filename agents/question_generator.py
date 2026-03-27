"""Adaptive interview question generator — concise, scenario-aware."""
import json
from utils.llm import call_llm

_BASE_PROMPT = """You are a technical interview question generator.

Generate ONE concise interview question (1–2 sentences max).

Rules:
- Adaptive difficulty from the given level
- Do NOT repeat any question from history
- Test THINKING, not memorization
- Use reasoning_fingerprint.depth to control how many sub-ideas are required:
  - surface: 1 small concept
  - moderate: 2 concepts connected
  - deep: 2-4 steps or trade-offs
- Use reasoning_fingerprint.thinking_type to shape the question style:
  - rote: ask for a definition + "how would you verify it?"
  - logical: ask for a short reasoning chain ("walk through your reasoning")
  - intuitive: ask for an analogy + one test/justification question
- Use reasoning_fingerprint.confidence_bias to calibrate follow-ups:
  - overconfident: include a "what could go wrong / edge case?" angle
  - underconfident: include a "start with first principles" angle
- Keep the question SHORT and focused (prefer one question + optional sub-question)
- {SCENARIO_INSTRUCTION}

Output ONLY valid JSON:
{{
  "question": "your question here"
}}

No explanations. JSON only."""

_SCENARIO_MAP = {
    "no":       "Ask a direct concept-based question.",
    "scenario": "Frame the question as a real-world scenario or situation.",
    "both":     "Alternate between concept-based and scenario-based questions.",
}


async def generate_question(
    jd_data: dict,
    fingerprint: dict,
    difficulty: str,
    history: list,
    scenario_mode: str = "no",
    variation_id: str | None = None,
    round_index: int | None = None,
) -> dict:
    """Generate a single adaptive interview question."""
    scenario_instruction = _SCENARIO_MAP.get(scenario_mode, _SCENARIO_MAP["no"])
    prompt = _BASE_PROMPT.format(SCENARIO_INSTRUCTION=scenario_instruction)

    past_questions = [h.get("question", "") for h in history[-8:]]
    context = json.dumps({
        "jd_data": jd_data,
        "reasoning_fingerprint": fingerprint,
        "current_difficulty": difficulty,
        "past_questions": past_questions,
        "scenario_mode": scenario_mode,
        "variation_id": variation_id or "",
        "round_index": round_index,
    })

    # Higher temperature here helps ensure new question sets on each run.
    result = await call_llm(prompt, context, max_tokens=180, temperature=0.65)
    if "question" not in result:
        result = {"question": result.get("raw", "Explain a core concept from your domain.")}
    return result
