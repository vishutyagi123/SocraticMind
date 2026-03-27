from utils.llm import call_llm

SYSTEM_PROMPT = """You are an expert technical recruiter and JD analyzer.

Given a job description text OR a domain name, extract structured data.

If given a domain name (like DSA, OS, DBMS, CN, ML), generate a realistic pseudo-JD for that domain.

You MUST output ONLY valid JSON in this exact format:
{
  "role": "the job role title",
  "skills": ["skill1", "skill2", "skill3"],
  "difficulty_level": "easy | medium | hard",
  "key_topics": ["topic1", "topic2", "topic3"]
}

No explanations. JSON only."""


async def analyze_jd(text: str) -> dict:
    """Analyze JD text or domain and return structured data."""
    result = await call_llm(SYSTEM_PROMPT, text, max_tokens=250, temperature=0.6)
    # Ensure required keys exist
    defaults = {
        "role": "Software Engineer",
        "skills": [],
        "difficulty_level": "medium",
        "key_topics": [],
    }
    for key, val in defaults.items():
        if key not in result:
            result[key] = val
    return result
