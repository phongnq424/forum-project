# app/services/rag_engine.py
from groq import AsyncGroq
from openai import AsyncOpenAI
from core.config import settings
from app.services.vector_db import search_relevant_context

# Initialize clients once
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

async def get_chatbot_response(messages: list):
    user_query = messages[-1]["content"] if messages else ""
    context = search_relevant_context(user_query)
    
    system_prompt = f"""You are an intelligent AI assistant of the WindFlow system.
    Please answer the user's question based on the following internal information:
    ---
    {context}
    ---
    If the internal information above does not contain the answer, respond using your general knowledge."""

    messages = [
        {"role": "system", "content": system_prompt}
    ] + messages

    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat failed: {e}")

    try:
        response = await openrouter_client.chat.completions.create(
            model="stepfun/step-3.5-flash:free", 
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenRouter failed: {e}")

    return "The system is currently under maintenance. Please try again in a few minutes!"