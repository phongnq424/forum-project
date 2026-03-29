# app/api/endpoints.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict

# Import đúng tên hàm và tên file
from app.services.rag_engine import get_chatbot_response
from app.services.moderation import moderate_text, moderate_image

router = APIRouter()

# Định nghĩa cấu trúc dữ liệu chặt chẽ
class ChatPayload(BaseModel):
    message: str # Tin nhắn cuối cùng để kiểm duyệt
    messages: List[Dict[str, str]] # Toàn bộ lịch sử chat để gửi cho AI

@router.post("/chat")
async def chat_endpoint(payload: ChatPayload):
    # 1. Kiểm duyệt text
    mod_result = await moderate_text(payload.message)
    if not mod_result.get("is_safe"):
        raise HTTPException(status_code=400, detail="Nội dung không phù hợp")
    
    # 2. Gọi Chatbot
    response = await get_chatbot_response(payload.messages)
    return {"reply": response}

@router.post("/moderate/image")
async def moderate_image_endpoint(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File không phải là ảnh")
        
    img_bytes = await file.read()
    result = await moderate_image(img_bytes)
    return {"is_safe": result}