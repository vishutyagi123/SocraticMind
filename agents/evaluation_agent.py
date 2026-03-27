import json
from utils.llm import call_llm

SYSTEM_PROMPT = """You are a technical interview evaluation engine.

Evaluate the candidate's response to the given question.

Output ONLY valid JSON:
{
  "correctness": "correct | partially_correct | incorrect",
  "confidence": "high | medium | low",
  "struggle_level": "none | mild | moderate | severe"
}

No explanations. JSON only."""


async def evaluate(question: str, answer: str, jd_data: dict) -> dict:
    """Evaluate a candidate's answer."""
    context = json.dumps(
        {"question": question, "answer": answer, "jd_context": jd_data}
    )
    result = await call_llm(SYSTEM_PROMPT, context, max_tokens=160, temperature=0.25)
    defaults = {
        "correctness": "partially_correct",
        "confidence": "medium",
        "struggle_level": "mild",
    }
    for key, val in defaults.items():
        if key not in result:
            result[key] = val
    return result
