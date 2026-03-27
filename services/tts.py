"""Text-to-Speech using gTTS."""
import tempfile
import threading
import os
from gtts import gTTS

_lock = threading.Lock()

def synthesize(text: str, out_path: str = None) -> str:
    """Convert text to speech and save as MP3. Returns file path."""
    if not text or not text.strip():
        return ""

    if out_path is None:
        fd, out_path = tempfile.mkstemp(suffix=".mp3")
        os.close(fd)

    with _lock:
        try:
            tts = gTTS(text=text, lang="en", tld="com")
            tts.save(out_path)
        except Exception as e:
            return ""

    return out_path if os.path.exists(out_path) and os.path.getsize(out_path) > 0 else ""
