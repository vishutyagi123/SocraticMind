"""In-memory session store with voice interview support."""
import uuid
from typing import Any


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, dict[str, Any]] = {}

    def create_session(
        self,
        jd_data: dict,
        max_questions: int = 10,
        scenario_mode: str = "no",
        variation_id: str | None = None,
    ) -> str:
        session_id = str(uuid.uuid4())
        if variation_id is None:
            variation_id = uuid.uuid4().hex[:8]

        initial_fingerprint = {
            "depth": "surface",
            "thinking_type": "rote",
            "confidence_bias": "balanced",
            "learning_velocity": "medium",
            "error_pattern": [],
            "consistency_score": 50,
        }
        initial_difficulty = jd_data.get("difficulty_level", "medium")
        self._sessions[session_id] = {
            "jd_data": jd_data,
            "variation_id": variation_id,
            "fingerprint": initial_fingerprint,
            "fingerprint_history": [initial_fingerprint.copy()],
            "difficulty": initial_difficulty,
            "difficulty_history": [initial_difficulty],
            "history": [],
            "performance_trend": [],
            "max_questions": max_questions,
            "scenario_mode": scenario_mode,
            # Mentor mode state
            "mentor_state": {},   # {topic: attempt_count}
            "mentor_history": [], # conversation log for mentor
        }
        return session_id

    def get(self, session_id: str) -> dict | None:
        return self._sessions.get(session_id)

    def update(self, session_id: str, key: str, value: Any):
        if session_id in self._sessions:
            self._sessions[session_id][key] = value

    def append_fingerprint(self, session_id: str, fingerprint: dict):
        if session_id in self._sessions:
            self._sessions[session_id]["fingerprint_history"].append(fingerprint.copy())

    def append_difficulty(self, session_id: str, difficulty: str):
        if session_id in self._sessions:
            self._sessions[session_id]["difficulty_history"].append(difficulty)

    def append_history(self, session_id: str, entry: dict):
        if session_id in self._sessions:
            self._sessions[session_id]["history"].append(entry)

    def append_trend(self, session_id: str, score: float):
        if session_id in self._sessions:
            self._sessions[session_id]["performance_trend"].append(score)

    def append_mentor_history(self, session_id: str, entry: dict):
        if session_id in self._sessions:
            self._sessions[session_id]["mentor_history"].append(entry)

    def increment_mentor_attempt(self, session_id: str, topic: str) -> int:
        """Increment attempt count for a topic and return new count."""
        if session_id in self._sessions:
            state = self._sessions[session_id].get("mentor_state", {})
            state[topic] = state.get(topic, 0) + 1
            self._sessions[session_id]["mentor_state"] = state
            return state[topic]
        return 0

    def get_mentor_attempt(self, session_id: str, topic: str) -> int:
        if session_id in self._sessions:
            state = self._sessions[session_id].get("mentor_state", {})
            return int(state.get(topic, 0))
        return 0

    def set_mentor_attempt(self, session_id: str, topic: str, attempt: int):
        if session_id in self._sessions:
            state = self._sessions[session_id].get("mentor_state", {})
            state[topic] = int(attempt)
            self._sessions[session_id]["mentor_state"] = state

    def get_weak_topics(self, session_id: str) -> list[str]:
        """Extract weak topics from interview history (score < 60)."""
        session = self.get(session_id)
        if not session:
            return []
        weak = []
        for h in session["history"]:
            if h.get("score", 100) < 60:
                q = (h.get("question", "") or "").strip()
                if q and all(q != w for w in weak):
                    weak.append(q)
        return weak[:5]  # Cap at 5 topics


store = SessionStore()
