"""Orchestrator — full agent pipeline with configurable limits, scenario mode, and mentor loop."""
from agents.jd_analyzer import analyze_jd
from agents.question_generator import generate_question
from agents.evaluation_agent import evaluate
from agents.reasoning_profiler import profile
from agents.adaptive_controller import adjust
from agents.socratic_mentor import mentor_question
from memory.session_store import store

import uuid


async def start_session(
    input_text: str,
    is_domain: bool = False,
    num_questions: int = 10,
    scenario_mode: str = "no",
) -> dict:
    """Start a new interview session."""
    variation_id = uuid.uuid4().hex[:8]
    jd_text = (
        f"Variation ID: {variation_id}. "
        f"Domain: {input_text}. Generate a pseudo job description for a technical interview in this domain."
        if is_domain
        else f"Variation ID: {variation_id}. {input_text}"
    )

    jd_data = await analyze_jd(jd_text)
    session_id = store.create_session(
        jd_data,
        max_questions=num_questions,
        scenario_mode=scenario_mode,
        variation_id=variation_id,
    )
    session = store.get(session_id)
    if not session:
        raise ValueError("Failed to create session")

    question_data = await generate_question(
        jd_data,
        session["fingerprint"],
        session["difficulty"],
        [],
        scenario_mode,
        variation_id=session.get("variation_id"),
        round_index=1,
    )
    initial_question = question_data.get("question", "")
    # Persist the initial question so the first /answer call evaluates correctly.
    store.append_history(session_id, {"question": initial_question})

    return {
        "session_id": session_id,
        "jd_data": jd_data,
        "question": initial_question,
        "difficulty": session["difficulty"],
        "max_questions": num_questions,
    }


async def process_answer(session_id: str, answer: str) -> dict:
    """Process user answer through the full agent pipeline."""
    session = store.get(session_id)
    if not session:
        return {"error": "Session not found"}

    max_q = session.get("max_questions", 10)
    scenario_mode = session.get("scenario_mode", "no")
    current_rounds = len([h for h in session["history"] if "evaluation" in h])

    if current_rounds >= max_q:
        return {"completed": True, "session_id": session_id}

    # Determine current question
    current_question = "General technical question"
    if session["history"]:
        current_question = session["history"][-1].get("question", current_question)

    jd_data = session["jd_data"]

    # Pipeline
    previous_fingerprint = session.get("fingerprint", {})

    evaluation = await evaluate(current_question, answer, jd_data)

    # First update fingerprint from this round.
    fingerprint = await profile(
        current_question,
        answer,
        evaluation,
        previous_fingerprint=previous_fingerprint,
        current_difficulty=session.get("difficulty"),
    )
    store.update(session_id, "fingerprint", fingerprint)
    store.append_fingerprint(session_id, fingerprint)

    # Difficulty update (keep this lightweight to reduce answer latency).
    difficulty_data = await adjust(
        fingerprint,
        evaluation,
        current_difficulty=session.get("difficulty", "medium"),
    )

    new_difficulty = difficulty_data.get("next_difficulty", session["difficulty"])
    store.update(session_id, "difficulty", new_difficulty)
    store.append_difficulty(session_id, new_difficulty)

    score = {"correct": 100, "partially_correct": 60, "incorrect": 20}.get(
        evaluation.get("correctness", ""), 50
    )
    store.append_trend(session_id, score)
    store.append_history(session_id, {
        "question": current_question,
        "answer": answer,
        "evaluation": evaluation,
        "score": score,
    })

    next_question_data = await generate_question(
        jd_data,
        fingerprint,
        new_difficulty,
        session["history"],
        scenario_mode,
        variation_id=session.get("variation_id"),
        round_index=current_rounds + 1,
    )
    next_question = next_question_data.get("question", "")
    store.append_history(session_id, {"question": next_question})

    updated_session = store.get(session_id)
    performance_trend = updated_session["performance_trend"] if updated_session else []
    completed = len([h for h in updated_session["history"] if "evaluation" in h]) >= max_q

    return {
        "evaluation": evaluation,
        "fingerprint": fingerprint,
        "difficulty": new_difficulty,
        "guidance": "",
        "next_question": next_question if not completed else "",
        "performance_trend": performance_trend,
        "completed": completed,
        "round": current_rounds + 1,
        "max_questions": max_q,
    }


async def run_mentor_loop(session_id: str, topic: str, answer: str) -> dict:
    """One iteration of the Socratic mentor RL loop."""
    session = store.get(session_id)
    if not session:
        return {"error": "Session not found"}

    jd_data = session.get("jd_data", {})
    current_attempt = store.get_mentor_attempt(session_id, topic)

    # Record user answer in mentor history
    store.append_mentor_history(session_id, {"role": "user", "topic": topic, "answer": answer})

    # "RL-like" adaptation signal: evaluate how well the learner responded.
    # This updates the hint tier (attempt_count) based on struggle severity.
    eval_result = await evaluate(topic, answer, jd_data)
    struggle = eval_result.get("struggle_level", "mild")
    correctness = eval_result.get("correctness", "partially_correct")

    # Reward shaping (simple): more struggle => higher hint tier; good answer => lower tier.
    if struggle == "severe" or correctness == "incorrect":
        attempt_count = min(3, current_attempt + 1)
    elif correctness == "correct" and struggle in ("none", "mild"):
        attempt_count = max(0, current_attempt - 1)
    else:
        attempt_count = current_attempt

    store.set_mentor_attempt(session_id, topic, attempt_count)

    mentor_history = session.get("mentor_history", [])
    result = await mentor_question(
        topic,
        attempt_count,
        mentor_history,
        reasoning_fingerprint=session.get("fingerprint", {}),
    )

    # Record AI response
    store.append_mentor_history(session_id, {
        "role": "mentor",
        "topic": topic,
        "question": result.get("question", ""),
        "reveal_answer": result.get("reveal_answer", False),
    })

    return {
        "question": result.get("question", ""),
        "reveal_answer": result.get("reveal_answer", False),
        "answer_text": result.get("answer_text"),
        "attempt_count": attempt_count,
        "topic": topic,
    }


async def get_mentor_start(session_id: str) -> dict:
    """Start the mentor session — return first weak topic + opening question."""
    session = store.get(session_id)
    if not session:
        return {"error": "Session not found"}

    weak_topics = store.get_weak_topics(session_id)
    if not weak_topics:
        # All answers were good — use last 3 questions as topics
        weak_topics = [
            h.get("question", "")
            for h in session["history"]
            if h.get("question")
        ][-3:]

    if not weak_topics:
        return {"error": "No topics found for mentor session"}

    first_topic = weak_topics[0]
    result = await mentor_question(
        first_topic, 0, [], reasoning_fingerprint=session.get("fingerprint", {})
    )

    return {
        "topics": weak_topics,
        "current_topic": first_topic,
        "question": result.get("question", ""),
        "reveal_answer": False,
        "answer_text": None,
        "attempt_count": 0,
    }
