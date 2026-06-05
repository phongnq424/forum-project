# app/services/rag_engine.py
import re
from groq import AsyncGroq
from openai import AsyncOpenAI
from core.config import settings
from app.services.vector_db import search_relevant_context

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

SMALL_TALK_PATTERNS = [
    r"^\s*(hi|hello|hey|yo|alo|hê lô|xin chào|chào|chào bạn|ê|e)\s*[!.?]*\s*$",
    r"^\s*(ok|oke|okay|ừ|uh|ừm|cảm ơn|thanks|thank you|tks)\s*[!.?]*\s*$",
    r"^\s*(bạn là ai|mày là ai|ai vậy|có đó không|are you there)\s*[!.?]*\s*$",
]

RAG_KEYWORDS = [
    "giải thích",
    "khái niệm",
    "là gì",
    "so sánh",
    "phân tích",
    "ví dụ",
    "cách",
    "hướng dẫn",
    "thuật toán",
    "dijkstra",
    "binary search",
    "dfs",
    "bfs",
    "database",
    "sql",
    "backend",
    "frontend",
    "api",
    "http",
    "network",
    "os",
    "oop",
    "solid",
    "spring",
    "nodejs",
    "express",
    "react",
    "svelte",
    "quy định",
    "nội quy",
    "tài liệu",
    "source",
    "document",
    "theory",
    "technical",
]


def get_latest_user_message(messages: list):
    if not messages:
        return ""

    for item in reversed(messages):
        if item.get("role") == "user":
            return item.get("content", "") or ""

    return messages[-1].get("content", "") or ""


def is_small_talk(message: str):
    normalized = (message or "").strip().lower()

    if not normalized:
        return True

    if len(normalized) <= 2:
        return True

    for pattern in SMALL_TALK_PATTERNS:
        if re.match(pattern, normalized, flags=re.IGNORECASE):
            return True

    return False


def should_use_rag(message: str):
    normalized = (message or "").strip().lower()

    if is_small_talk(normalized):
        return False

    if len(normalized.split()) <= 2:
        return False

    return any(keyword in normalized for keyword in RAG_KEYWORDS)


def build_general_system_prompt():
    return """
You are the WindFlow AI Assistant for a student programming forum.

Rules:
1. Reply in the same language as the user's message.
2. If the user greets you, reply naturally and briefly.
3. If the user asks a general programming question, answer clearly and practically.
4. Do not cite internal documents unless internal context is provided.
5. Do not pretend that you used documents when no context was provided.
"""


def build_rag_system_prompt(context: str):
    return f"""
You are the WindFlow Advanced AI Assistant.

You may use the following retrieved internal context only if it is directly relevant to the user's question.

INTERNAL CONTEXT:
---
{context}
---

STRICT INSTRUCTIONS:
1. Respond in the same language as the user's query.
2. If the context directly answers the question, use it and cite the source at the end of the relevant paragraph.
3. If the context is only weakly related, ignore it and answer normally.
4. If the answer is not in the context, use general knowledge and clearly say it is not from official internal docs.
5. Never force unrelated context into greetings, small talk, or simple conversational replies.
"""


async def call_groq(messages: list):
    response = await groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.4
    )

    return response.choices[0].message.content


async def call_openrouter(messages: list):
    response = await openrouter_client.chat.completions.create(
        model="stepfun/step-3.5-flash:free",
        messages=messages,
        temperature=0.4
    )

    return response.choices[0].message.content


async def get_chatbot_response(messages: list):
    user_query = get_latest_user_message(messages)

    use_rag = should_use_rag(user_query)
    context_result = {
        "has_context": False,
        "context": "",
        "sources": [],
        "best_distance": None
    }

    if use_rag:
        context_result = search_relevant_context(
            user_query,
            n_results=6,
            max_distance=1.05
        )

    print(
        "--- RAG DEBUG ---\n"
        f"query: {user_query}\n"
        f"use_rag: {use_rag}\n"
        f"has_context: {context_result.get('has_context')}\n"
        f"best_distance: {context_result.get('best_distance')}\n"
        f"sources: {context_result.get('sources')}\n"
        "-----------------"
    )

    if use_rag and context_result.get("has_context"):
        system_prompt = build_rag_system_prompt(context_result["context"])
    else:
        system_prompt = build_general_system_prompt()

    final_messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ] + messages

    try:
        return await call_groq(final_messages)
    except Exception as e:
        print(f"Groq Chat failed: {e}")

    try:
        return await call_openrouter(final_messages)
    except Exception as e:
        print(f"OpenRouter failed: {e}")

    return "The system is currently under maintenance. Please try again in a few minutes!"