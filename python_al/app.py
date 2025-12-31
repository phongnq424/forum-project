import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from llama_cpp import Llama
from dotenv import load_dotenv
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str     
    content: str

class QuestionRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]]

# 1. Load biến môi trường từ file .env
load_dotenv()

app = FastAPI()

# 2. Lấy cấu hình và kiểm tra đường dẫn
MODEL_PATH = os.getenv("MODEL_PATH")
INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")

if not os.path.exists(MODEL_PATH):
    # Log ra đường dẫn hiện tại để bạn dễ debug
    print(f"DEBUG: Current Directory: {os.getcwd()}")
    raise RuntimeError(f"MODEL_PATH không tồn tại tại: {os.abspath(MODEL_PATH)}")

if not INTERNAL_TOKEN:
    raise RuntimeError("INTERNAL_TOKEN chưa được thiết lập trong môi trường")

# 3. Khởi tạo LLM
llm = Llama(model_path=MODEL_PATH, n_ctx=2048, n_threads = 4, n_batch = 512, verbose=True)


@app.post("/ask")
def ask(data: QuestionRequest, authorization: str = Header(None)): # Đổi class Question thành QuestionRequest
    if authorization != f"Bearer {INTERNAL_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    system_message = (
        "Bạn là chuyên gia lập trình của trang web FlowWind. "
        "Chỉ trả lời các câu hỏi liên quan đến lập trình bằng tiếng Việt. "
        "Hãy dựa vào lịch sử trò chuyện (nếu có) để trả lời mạch lạc."
    )

    # 4. Bắt đầu build Prompt với System Message
    prompt = f"<|im_start|>system\n{system_message}<|im_end|>\n"
    
    # CHÈN LỊCH SỬ VÀO ĐÂY (Đây là phần giúp nó hết trả lời không liên quan)
    if data.history:
        for msg in data.history:
            prompt += f"<|im_start|>{msg.role}\n{msg.content}<|im_end|>\n"
    
    # Thêm câu hỏi hiện tại của User
    prompt += f"<|im_start|>user\n{data.question}<|im_end|>\n"
    prompt += f"<|im_start|>assistant\n"

    output = llm(
        prompt,
        max_tokens=512,
        temperature=0.2, # Giảm xuống 0.2 để nó bớt "sáng tạo" linh tinh
        stop=["<|im_end|>", "<|im_start|>"]
    )

    answer = output["choices"][0]["text"].strip()
    return {"answer": answer}