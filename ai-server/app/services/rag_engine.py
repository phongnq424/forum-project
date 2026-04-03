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
    print(f"--- DEBUG CONTEXT FOUND ---\n{context}\n---------------------------")
    system_prompt = f"""You are the WindFlow Advanced AI Assistant. 
        You are provided with specialized internal context (IT theory, technical docs, and internal regulations).

        INTERNAL CONTEXT:
        ---
        {context}
        ---

        STRICT INSTRUCTIONS:
        1. LANGUAGE: Respond in the same language as the user's query.
        2. TECHNICAL ACCURACY: For IT theory (TYPE: technical), prioritize the provided context. Use professional terminology.
        3. CITATION: If the information comes from the context, you MUST cite it at the end of the paragraph. 
        Example: [Source: Sei.pdf, Page 5] or [Source: network_theory.docx].
        4. REASONING: If the user asks about a situation, cross-reference it with the internal regulations (TYPE: internal) to provide a logical conclusion.
        5. HONESTY: If the answer is not in the context, use your general knowledge but clearly state: "Based on my general knowledge (not official internal docs)..."
        """

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