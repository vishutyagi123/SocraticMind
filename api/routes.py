"""API routes — voice interview, STT, TTS, mentor mode."""
import os
import io
import tempfile

from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

from services.orchestrator import (
    start_session,
    process_answer,
    run_mentor_loop,
    get_mentor_start,
)
from services.stt import transcribe
from services.tts import synthesize
from services.vad import analyze_audio, decide_action
from memory.session_store import store

router = APIRouter(prefix="/api")


def _guess_suffix(upload: UploadFile) -> str:
    """Pick a file suffix from upload filename (best-effort)."""
    try:
        name = (upload.filename or "").lower()
        ext = os.path.splitext(name)[1]
        if ext:
            return ext
    except Exception:
        pass
    return ".wav"


async def _write_upload_to_temp(upload: UploadFile) -> str:
    suffix = _guess_suffix(upload)
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await upload.read())
        return tmp.name


# ─────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────

class StartRequest(BaseModel):
    jd_text: str = ""
    domain: str = ""
    num_questions: int = 10
    scenario_mode: str = "no"  # "no" | "scenario" | "both"


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


class TTSRequest(BaseModel):
    text: str


class MentorAnswerRequest(BaseModel):
    session_id: str
    topic: str
    answer: str


class MentorStartRequest(BaseModel):
    session_id: str


# ─────────────────────────────────────────────
# Standard interview endpoints
# ─────────────────────────────────────────────

@router.post("/start")
async def start(req: StartRequest):
    """Start a new interview session."""
    if req.domain:
        result = await start_session(
            req.domain,
            is_domain=True,
            num_questions=req.num_questions,
            scenario_mode=req.scenario_mode,
        )
    elif req.jd_text:
        result = await start_session(
            req.jd_text,
            is_domain=False,
            num_questions=req.num_questions,
            scenario_mode=req.scenario_mode,
        )
    else:
        return {"error": "Provide either domain or jd_text"}
    return result


@router.post("/answer")
async def answer(req: AnswerRequest):
    """Submit an answer and get evaluation + next question."""
    result = await process_answer(req.session_id, req.answer)
    return result


@router.post("/process")
async def process_audio(
    session_id: str = Form(...),
    audio: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Unified endpoint: 
    1. Receive user speech (audio file)
    2. Transcribe using STT
    3. Evaluate answer via AI Model/Logic Engine
    4. Return evaluation and next question.
    """
    upload = audio or file
    if upload is None:
        raise HTTPException(status_code=400, detail="Missing audio file")

    tmp_path = await _write_upload_to_temp(upload)

    try:
        # 1. Speech to text
        text = transcribe(tmp_path)
        
        # 2. Early return if no speech detected
        if not text.strip():
            return {"error": "No speech detected", "transcribed_text": ""}
            
        # 3. Process answer (AI Model -> RAG -> Logic)
        result = await process_answer(session_id, text)
        
        # 4. Include the transcribed text in the response
        result["transcribed_text"] = text
        
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get full session state."""
    session = store.get(session_id)
    if not session:
        return {"error": "Session not found"}
    return session


# ─────────────────────────────────────────────
# Voice endpoints
# ─────────────────────────────────────────────

@router.post("/stt")
async def stt_endpoint(audio: Optional[UploadFile] = File(None), file: Optional[UploadFile] = File(None)):
    """Speech-to-Text: accept WAV upload, return transcription + VAD info."""
    upload = audio or file
    if upload is None:
        raise HTTPException(status_code=400, detail="Missing audio file")

    tmp_path = await _write_upload_to_temp(upload)

    try:
        text = transcribe(tmp_path)
        vad_info = analyze_audio(tmp_path)
        action = decide_action(
            vad_info.get("trailing_silence", 0),
            has_partial=bool(text.strip()),
            answer_quality="",
        )
        return {
            "text": text,
            "vad": vad_info,
            "action": action,
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/tts")
async def tts_endpoint(req: TTSRequest):
    """Text-to-Speech: return WAV audio bytes."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")

    wav_path = synthesize(req.text)
    if not wav_path or not os.path.exists(wav_path):
        raise HTTPException(status_code=500, detail="TTS generation failed")

    try:
        with open(wav_path, "rb") as f:
            wav_bytes = f.read()
    finally:
        try:
            os.remove(wav_path)
        except Exception:
            pass

    return Response(
        content=wav_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": 'inline; filename="tts_output.mp3"'},
    )


# ─────────────────────────────────────────────
# Socratic Mentor Mode endpoints
# ─────────────────────────────────────────────

@router.post("/mentor/start")
async def mentor_start(req: MentorStartRequest):
    """Begin mentor mode — return first weak topic and opening question."""
    result = await get_mentor_start(req.session_id)
    return result


@router.post("/mentor/answer")
async def mentor_answer(req: MentorAnswerRequest):
    """Submit answer in mentor mode — returns next Socratic question or reveal."""
    result = await run_mentor_loop(req.session_id, req.topic, req.answer)
    return result
