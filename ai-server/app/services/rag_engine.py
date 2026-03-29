# app/services/rag_engine.py
from groq import Groq
from openai import OpenAI
from core.config import settings

# Khởi tạo client 1 lần
groq_client = Groq(api_key=settings.GROQ_API_KEY)
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

async def get_chatbot_response(messages: list):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat failed: {e}")

    try:
        response = openrouter_client.chat.completions.create(
            model="stepfun/step-3.5-flash:free", 
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenRouter failed: {e}")

    return "Hệ thống đang bảo trì, mình sẽ quay lại sau ít phút!"