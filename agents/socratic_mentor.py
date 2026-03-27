"""Socratic Mentor — interview-phase guidance + post-interview RL mentor loop."""
import json
from utils.llm import call_llm

# ──────────────────────────────────────────────────────────────
# Interview-phase: hint without revealing the answer
# ──────────────────────────────────────────────────────────────
_GUIDE_PROMPT = """You are a Socratic mentor for technical interviews.

STRICT RULES:
- NEVER give the answer directly
- NEVER provide the complete solution, key steps, or a paraphrase that effectively gives the answer.
- Do NOT explain the solution or justify it with a full reasoning chain.
- Provide ONLY: a guiding question OR a subtle nudge that helps the learner derive it themselves.

Output ONLY valid JSON:
{
  "guidance": "your hint or guiding question here"
}

No explanations. JSON only."""


async def guide(
    question: str,
    answer: str,
    evaluation: dict,
    reasoning_fingerprint: dict | None = None,
) -> dict:
    """Provide Socratic guidance without revealing the answer."""
    context = json.dumps(
        {
            "question": question,
            "answer": answer,
            "evaluation": evaluation,
            "reasoning_fingerprint": reasoning_fingerprint or {},
        }
    )
    result = await call_llm(_GUIDE_PROMPT, context, max_tokens=180, temperature=0.25)
    guidance = result.get("guidance") if isinstance(result, dict) else None

    # Hard guardrail: if the model tries to reveal an answer, replace it.
    if not guidance or not isinstance(guidance, str):
        guidance = "What are the smallest steps you would try first to reason through this?"
    elif any(
        kw in guidance.lower()
        for kw in (
            "the answer",
            "correct answer",
            "solution",
            "the solution",
            "because ",
            "therefore ",
        )
    ):
        guidance = "What assumption or definition are you using here, and can you test it against the question?"

    # Question-only constraint (avoid multi-sentence explanations).
    guidance = guidance.strip()
    if "." in guidance and guidance.count(".") >= 1:
        guidance = "What is your first step to reason from the problem statement here?"
    if len(guidance) > 220:
        guidance = guidance[:220].rstrip()

    result = {"guidance": guidance}
    return result


# ──────────────────────────────────────────────────────────────
# Post-interview Mentor Mode with RL loop
# ──────────────────────────────────────────────────────────────
_MENTOR_PROMPT = """You are a Socratic Mentor running a post-interview deep-dive session.

Your goal is to help the learner understand their weak areas.

Rules based on attempt_count:
- attempt_count 0: Ask an open-ended guiding question about the topic. Do NOT reveal the answer.
- attempt_count 1: Re-ask from a different angle or give a subtle hint. Still no direct answer.
- attempt_count 2: Provide a stronger hint with a partial example structure, but DO NOT give the final answer.
- attempt_count >= 3: Keep guiding (stronger nudges), but NEVER reveal the complete correct answer.

Formatting rules (hard):
- Output MUST be ONLY a single question. No declarative sentences, no definitions.
- Do not use phrasing like "X is ...", "X means ...", "The correct answer is ...".

Output ONLY valid JSON:
{
  "question": "your guiding question or revealed answer text",
  "reveal_answer": false,
  "answer_text": null
}

If reveal_answer is true, fill answer_text with null (never reveal answers).
No explanations outside JSON. JSON only."""


async def mentor_question(
    topic: str,
    attempt_count: int,
    history: list,
    reasoning_fingerprint: dict | None = None,
) -> dict:
    """Generate a mentor question with RL-based reveal logic."""
    context = json.dumps({
        "weak_topic": topic,
        "attempt_count": attempt_count,
        "should_reveal": False,
        "conversation_history": history[-6:],
        "reasoning_fingerprint": reasoning_fingerprint or {},
    })
    result = await call_llm(_MENTOR_PROMPT, context, max_tokens=140, temperature=0.3)
    defaults = {
        "question": f"What do you understand about {topic}?",
        "reveal_answer": False,
        "answer_text": None,
    }
    if not isinstance(result, dict):
        return defaults

    # Enforce the no-answer constraint everywhere.
    merged = {**defaults, **result}
    merged["reveal_answer"] = False
    merged["answer_text"] = None

    # Sanitizer: if the model added declarative/explanatory text, replace with a question-only fallback.
    q = merged.get("question")
    if isinstance(q, str):
        q_stripped = q.strip()
        # Strong signal: explanatory text often includes periods before the final question mark.
        if q_stripped.endswith("?") and q_stripped.count(".") >= 1:
            if attempt_count <= 1:
                merged["question"] = f"Which part of {topic} felt most confusing, and why?"
            elif attempt_count == 2:
                merged["question"] = f"Can you outline your reasoning steps for {topic} (step 1, then step 2)?"
            else:
                merged["question"] = f"After reviewing your previous answer, what would you change in your reasoning about {topic}?"
        elif q_stripped.lower().startswith(("that's", "that is", "the answer")):
            merged["question"] = defaults["question"]

    return merged
