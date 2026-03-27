import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
MODEL_NAME: str = os.getenv("MODEL_NAME", "llama3-70b-8192")
TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.3"))
GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
