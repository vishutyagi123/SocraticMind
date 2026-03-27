import json
import httpx
from utils.config import GROQ_API_KEY, MODEL_NAME, TEMPERATURE, GROQ_API_URL


async def call_llm(
    system_prompt: str,
    user_message: str,
    *,
    max_tokens: int = 350,
    temperature: float | None = None,
) -> dict:
    """Call Groq LLM and return parsed JSON response."""
    import os

    log_file = "d:/Socratic_Mind/llm_debug.log"
    debug_log = os.getenv("LLM_DEBUG_LOG", "").lower() in ("1", "true", "yes", "on")
    try:
        temp = temperature if temperature is not None else TEMPERATURE
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temp,
            "max_tokens": max_tokens,
        }

        if debug_log:
            with open(log_file, "a") as f:
                f.write(f"\n--- Calling LLM ---\n")
                f.write(f"Payload: {json.dumps(payload, indent=2)}\n")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=payload)
            
            if debug_log:
                with open(log_file, "a") as f:
                    f.write(f"Response status: {response.status_code}\n")
                    f.write(f"Response text: {response.text}\n")
                
            response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        if debug_log:
            with open(log_file, "a") as f:
                f.write(f"Content: {content}\n")

        # Parse JSON from response, handling markdown code blocks
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1])

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Best-effort extraction: try to load the first JSON object inside the text.
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1 and end > start:
                candidate = content[start : end + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    pass
            return {"raw": content}
    except Exception as e:
        if debug_log:
            with open(log_file, "a") as f:
                f.write(f"EXCEPTION: {str(e)}\n")
        raise e
