# app/api/endpoints.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.services.submission_analyzer import analyze_submission_mistake
from app.services.rag_engine import get_chatbot_response
from app.services.moderation import moderate_text, moderate_image
from core.config import settings

router = APIRouter()
security = HTTPBearer()


class ChatPayload(BaseModel):
    message: str
    messages: List[Dict[str, str]]


class ChatResponse(BaseModel):
    success: bool
    reply: str = ""
    error: str = ""
    is_safe: bool = True


class TextModPayload(BaseModel):
    text: str


class TextModResponse(BaseModel):
    success: bool
    is_safe: bool
    error: str = ""


class ImageModResponse(BaseModel):
    success: bool
    is_safe: bool
    error: str = ""

class SubmissionAnalyzePayload(BaseModel):
    submissionId: Optional[str] = None
    judgeStatus: Optional[str] = None
    score: Optional[float] = None
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    error_message: Optional[str] = None
    language: Optional[Dict[str, Any]] = None
    code: Optional[str] = None
    kind: Optional[str] = None
    challenge: Optional[Dict[str, Any]] = None
    testcaseResults: Optional[List[Dict[str, Any]]] = None


class SubmissionAnalyzeResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    mistake_type: str = "UNKNOWN"
    mistake_level: str = "LOW"
    explanation: Optional[str] = None
    suggestion: Optional[str] = None
    confidence: Optional[float] = None
    topics: List[Dict[str, Any]] = []
    model_name: Optional[str] = None
    prompt_version: Optional[str] = None
    error: str = ""


@router.post("/chat")
async def chat_endpoint(
    payload: ChatPayload,
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    mod_result = await moderate_text(payload.message)

    if not mod_result.get("is_safe"):
        return ChatResponse(
            success=False,
            is_safe=False,
            error="Content violates policy"
        )

    try:
        response = await get_chatbot_response(payload.messages)
        return ChatResponse(success=True, reply=response)
    except Exception as e:
        return ChatResponse(
            success=False,
            error=f"AI Engine Error: {str(e)}"
        )


@router.post("/moderate/text")
async def moderate_text_endpoint(
    payload: TextModPayload,
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not payload.text or not payload.text.strip():
        return TextModResponse(success=True, is_safe=True)

    try:
        result = await moderate_text(payload.text)
        return TextModResponse(
            success=True,
            is_safe=bool(result.get("is_safe", True))
        )
    except Exception as e:
        return TextModResponse(
            success=False,
            is_safe=False,
            error=str(e)
        )


@router.post("/moderate/image")
async def moderate_image_endpoint(
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")

    try:
        img_bytes = await file.read()
        result = await moderate_image(img_bytes)
        return ImageModResponse(success=True, is_safe=result)
    except Exception as e:
        return ImageModResponse(
            success=False,
            is_safe=False,
            error=str(e)
        )

@router.post("/submission/analyze")
async def analyze_submission_endpoint(
    payload: SubmissionAnalyzePayload,
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        result = await analyze_submission_mistake(payload.model_dump())
        return SubmissionAnalyzeResponse(**result)
    except Exception as e:
        return SubmissionAnalyzeResponse(
            success=False,
            mistake_type="UNKNOWN",
            mistake_level="LOW",
            error=str(e)
        )