"""Voice Activity Detection using webrtcvad + smart silence decision logic."""
import wave
import numpy as np
import os

try:
    import webrtcvad
    _HAS_VAD = True
except ImportError:
    try:
        import webrtcvad_wheels as webrtcvad  # pre-built wheels alternative
        _HAS_VAD = True
    except ImportError:
        _HAS_VAD = False

try:
    from scipy import signal as scipy_signal
    _HAS_SCIPY = True
except ImportError:
    _HAS_SCIPY = False


def _load_wav_as_pcm16(wav_path: str):
    """Load WAV file, convert to 16kHz mono 16-bit PCM."""
    with wave.open(wav_path, "rb") as wf:
        sample_rate = wf.getframerate()
        n_channels = wf.getnchannels()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    audio = np.frombuffer(raw, dtype=np.int16)

    # Mix down to mono
    if n_channels > 1:
        audio = audio.reshape(-1, n_channels).mean(axis=1).astype(np.int16)

    # Resample to 16000 Hz
    if sample_rate != 16000:
        if _HAS_SCIPY:
            audio = scipy_signal.resample_poly(audio, 16000, sample_rate).astype(np.int16)
        else:
            # Naive integer resampling
            ratio = 16000 / sample_rate
            new_len = int(len(audio) * ratio)
            indices = (np.arange(new_len) / ratio).astype(int)
            indices = np.clip(indices, 0, len(audio) - 1)
            audio = audio[indices]

    return audio, 16000


def analyze_audio(wav_path: str) -> dict:
    """Analyze audio and return VAD stats."""
    if not os.path.exists(wav_path):
        return {"total_duration": 0, "trailing_silence": 0, "has_speech": False, "speech_ratio": 0}

    try:
        audio, sr = _load_wav_as_pcm16(wav_path)
    except Exception as e:
        return {"total_duration": 0, "trailing_silence": 0, "has_speech": False, "speech_ratio": 0, "error": str(e)}

    total_duration = len(audio) / sr
    frame_ms = 30
    frame_size = int(sr * frame_ms / 1000)

    vad = webrtcvad.Vad(2)  # aggressiveness 0–3
    speech_flags = []

    for i in range(0, len(audio) - frame_size, frame_size):
        frame = audio[i: i + frame_size].tobytes()
        try:
            speech_flags.append(vad.is_speech(frame, sr))
        except Exception:
            speech_flags.append(False)

    trailing_silence = 0.0
    for flag in reversed(speech_flags):
        if not flag:
            trailing_silence += frame_ms / 1000
        else:
            break

    has_speech = any(speech_flags)
    speech_ratio = sum(speech_flags) / max(len(speech_flags), 1)

    return {
        "total_duration": round(total_duration, 2),
        "trailing_silence": round(trailing_silence, 2),
        "has_speech": has_speech,
        "speech_ratio": round(speech_ratio, 2),
    }


def decide_action(trailing_silence: float, has_partial: bool, answer_quality: str = "") -> dict:
    """Smart silence handling decision logic (4-tier)."""
    if trailing_silence < 3:
        return {"state": "listening", "action": "wait",
                "message": "Still listening…"}
    elif trailing_silence < 6:
        return {"state": "thinking", "action": "wait",
                "message": "Take your time, thinking is good…"}
    elif trailing_silence < 10:
        if has_partial:
            return {"state": "thinking", "action": "hint",
                    "message": "You seem to be thinking — here's a nudge…"}
        else:
            return {"state": "stuck", "action": "hint",
                    "message": "Let me give you a guiding hint…"}
    else:
        if answer_quality in ("correct", "partially_correct"):
            return {"state": "finished", "action": "next",
                    "message": "Good answer! Moving to the next question."}
        else:
            return {"state": "stuck", "action": "hint_then_next",
                    "message": "Let me give you a hint before we move on."}
