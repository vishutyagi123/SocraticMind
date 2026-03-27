import json
from utils.llm import call_llm

SYSTEM_PROMPT = """You are an adaptive difficulty controller for a technical interview.

Based on the reasoning fingerprint and evaluation, decide the next difficulty level.

Rules:
- Good performance (correct, high confidence, no struggle) → increase difficulty
- Struggling (incorrect, severe struggle) → decrease difficulty
- Average → maintain current level
- Always step at most one level per round (easy <-> medium <-> hard <-> expert).

Output ONLY valid JSON:
{
  "next_difficulty": "easy | medium | hard | expert"
}

No explanations. JSON only."""


async def adjust(fingerprint: dict, evaluation: dict, current_difficulty: str = "medium") -> dict:
    """Determine next difficulty level."""
    context = json.dumps(
        {
            "fingerprint": fingerprint,
            "evaluation": evaluation,
            "current_difficulty": current_difficulty,
        }
    )
    result = await call_llm(SYSTEM_PROMPT, context, max_tokens=80, temperature=0.2)
    # Fallback below; keep response short for speed.
    next_difficulty = result.get("next_difficulty") if isinstance(result, dict) else None

    levels = ["easy", "medium", "hard", "expert"]
    if current_difficulty not in levels:
        current_difficulty = "medium"

    def _clamp_level(idx: int) -> str:
        idx = max(0, min(len(levels) - 1, idx))
        return levels[idx]

    # Deterministic fallback aligned with your spec.
    correctness = evaluation.get("correctness")
    confidence = evaluation.get("confidence")
    struggle = evaluation.get("struggle_level")
    idx = levels.index(current_difficulty)

    if struggle == "severe" or correctness == "incorrect":
        fallback = _clamp_level(idx - 1)
    elif correctness == "correct" and confidence == "high" and struggle in ("none", None):
        fallback = _clamp_level(idx + 1)
    else:
        fallback = _clamp_level(idx)

    if next_difficulty in levels:
        return {"next_difficulty": next_difficulty}
    return {"next_difficulty": fallback}
