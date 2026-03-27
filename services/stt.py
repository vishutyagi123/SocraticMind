"""Speech-to-Text using faster-whisper (local, no API key)."""
from faster_whisper import WhisperModel

_model = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        # Faster for hackathons. Override via env if needed.
        model_name = "tiny"
        try:
            import os

            model_name = os.getenv("WHISPER_MODEL_NAME", model_name)
        except Exception:
            pass
        _model = WhisperModel(model_name, device="cpu", compute_type="int8")
    return _model


def transcribe(wav_path: str) -> str:
    """Transcribe a WAV file and return the text."""
    model = _get_model()
    # vad_filter can be brittle for browser-recorded formats; disable for robustness.
    segments, _ = model.transcribe(
        wav_path,
        beam_size=1,
        language="en",
        vad_filter=False,
    )
    return " ".join(seg.text.strip() for seg in segments).strip()
