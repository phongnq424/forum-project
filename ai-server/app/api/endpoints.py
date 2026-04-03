# app/api/endpoints.py
import os

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from pydantic import BaseModel
from typing import List, Dict

# Import đúng tên hàm và tên file
from app.services.rag_engine import get_chatbot_response
from app.services.moderation import moderate_text, moderate_image
from core.config import settings

router = APIRouter()
security = HTTPBearer()

# Định nghĩa cấu trúc dữ liệu chặt chẽ
class ChatPayload(BaseModel):
    message: str # Tin nhắn cuối cùng để kiểm duyệt
    messages: List[Dict[str, str]] # Toàn bộ lịch sử chat để gửi cho AI

class ChatResponse(BaseModel):
    success: bool
    reply: str = ""
    error: str = ""
    is_safe: bool = True

class ImageModResponse(BaseModel):
    success: bool
    is_safe: bool
    error: str = ""

@router.post("/chat")
async def chat_endpoint(payload: ChatPayload, auth: HTTPAuthorizationCredentials = Depends(security)):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    mod_result = await moderate_text(payload.message)
    if not mod_result.get("is_safe"):
        return ChatResponse(success=False, is_safe=False, error="Content violates policy")
    try:
        response = await get_chatbot_response(payload.messages)
        return ChatResponse(success=True, reply=response)
    except Exception as e:
        return ChatResponse(success=False, error=f"AI Engine Error: {str(e)}")

@router.post("/moderate/image")
async def moderate_image_endpoint(file: UploadFile = File(...), auth: HTTPAuthorizationCredentials = Depends(security)):
    if auth.credentials != settings.AI_SERVER_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image")
        
    try:
        img_bytes = await file.read()
        result = await moderate_image(img_bytes)
        return ImageModResponse(success=True, is_safe=result)
    except Exception as e:
        return ImageModResponse(success=False, is_safe=False, error=str(e))