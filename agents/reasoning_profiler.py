import json
from utils.llm import call_llm

SYSTEM_PROMPT = """You are a cognitive analysis engine that profiles how a person thinks.

Analyze the user's response, the question, and the evaluation to build a reasoning fingerprint.

Use the previous reasoning_fingerprint to update (not overwrite) tendencies over time.

Output ONLY valid JSON:
{
  "depth": "surface | moderate | deep",
  "thinking_type": "rote | logical | intuitive | hybrid",
  "confidence_bias": "overconfident | underconfident | balanced",
  "learning_velocity": "slow | medium | fast",
  "error_pattern": [],
  "consistency_score": 50
}

error_pattern should be a list from: ["conceptual", "calculation", "misinterpretation"]
consistency_score is 0-100.

No explanations. JSON only."""


async def profile(
    question: str,
    answer: str,
    evaluation: dict,
    previous_fingerprint: dict | None = None,
    current_difficulty: str | None = None,
) -> dict:
    """Profile the user's reasoning from their response."""
    context = json.dumps(
        {
            "question": question,
            "answer": answer,
            "evaluation": evaluation,
            "previous_fingerprint": previous_fingerprint or {},
            "current_difficulty": current_difficulty or None,
        }
    )
    result = await call_llm(SYSTEM_PROMPT, context, max_tokens=200, temperature=0.25)
    defaults = {
        "depth": "surface",
        "thinking_type": "rote",
        "confidence_bias": "balanced",
        "learning_velocity": "medium",
        "error_pattern": [],
        "consistency_score": 50,
    }
    for key, val in defaults.items():
        if key not in result:
            result[key] = val
    return result
