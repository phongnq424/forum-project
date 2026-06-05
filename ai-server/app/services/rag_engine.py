# app/services/rag_engine.py
import re
import json
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
    r"^\s*(hi|hello|hey|yo|good morning|good afternoon|good evening)\s*[!.?]*\s*$",
    r"^\s*(ok|okay|thanks|thank you|ty|got it)\s*[!.?]*\s*$",
    r"^\s*(who are you|are you there)\s*[!.?]*\s*$",
]

RAG_KEYWORDS = [
    "explain",
    "concept",
    "what is",
    "compare",
    "analysis",
    "example",
    "how to",
    "guide",
    "tutorial",
    "algorithm",
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
    "rules",
    "policy",
    "document",
    "source",
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
1. Always reply in English.
2. If the user greets you, reply naturally and briefly in English.
3. If the user asks a general programming question, answer clearly and practically in English.
4. Use Markdown formatting when helpful.
5. Do not cite internal documents unless internal context is provided.
6. Do not pretend that you used documents when no context was provided.
7. Keep the answer concise, practical, and friendly.
"""


def build_rag_system_prompt(context: str):
    return f"""
You are the WindFlow Advanced AI Assistant for a student programming forum.

You may use the following retrieved internal context only when it is directly relevant to the user's question.

INTERNAL CONTEXT:
---
{context}
---

STRICT INSTRUCTIONS:
1. Always respond in English.
2. If the context directly answers the question, use it and cite the source at the end of the relevant paragraph.
3. If the context is only weakly related, ignore it and answer normally.
4. If the answer is not in the context, use general knowledge and clearly say it is not from official internal docs.
5. Never force unrelated context into greetings, small talk, or simple conversational replies.
6. Use Markdown formatting when helpful.
7. Keep the answer concise, practical, and friendly.
"""


async def call_groq(messages: list):
    response = await groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.25
    )

    return response.choices[0].message.content


async def call_openrouter(messages: list):
    response = await openrouter_client.chat.completions.create(
        model="stepfun/step-3.5-flash:free",
        messages=messages,
        temperature=0.25
    )

    return response.choices[0].message.content


def extract_json_object(text: str):
    cleaned = (text or "").strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", cleaned)

        if not match:
            raise ValueError("No JSON object found in AI response")

        return json.loads(match.group(0))


def normalize_history(history: list | None):
    recent_history = []

    if isinstance(history, list):
        for item in history[-8:]:
            role = item.get("role", "")
            content = item.get("content", "")

            if role and content:
                recent_history.append({
                    "role": role,
                    "content": str(content)[:600]
                })

    return recent_history


def normalize_card(card: dict):
    return {
        "id": str(card.get("id", "")),
        "type": str(card.get("type", "")),
        "title": str(card.get("title", ""))[:180],
        "description": str(card.get("description", ""))[:300],
        "meta": str(card.get("meta", ""))[:160],
        "url": str(card.get("url", "")),
    }


def normalize_cards(cards: list | None, limit: int = 30):
    if not isinstance(cards, list):
        return []

    output = []

    for item in cards[:limit]:
        if isinstance(item, dict):
            normalized = normalize_card(item)

            if normalized["id"] and normalized["type"] and normalized["title"]:
                output.append(normalized)

    return output


async def classify_chat_intent(message: str, history: list | None = None):
    recent_history = normalize_history(history)

    prompt = f"""
You are an intent classifier for WindFlow, an English-only programming forum.

Your job is to understand the user's intent and return ONLY valid JSON.
Do not answer the user.
Do not return markdown.
Do not explain.

WindFlow has these real website resources:

1. POST
Readable content on the website.
Examples:
- posts
- articles
- discussions
- threads
- things the user wants to read, browse, or explore

2. CHALLENGE
Practice content on the website.
Examples:
- coding challenges
- SQL challenges
- backend challenges
- algorithm / DSA challenges
- contests
- exercises
- problems
- things the user wants to solve, practice, or train with

Supported challenge types:
- DSA
- SQL
- BACKEND
- CONTEST

Return this JSON schema:
{{
  "intent": "GENERAL_CHAT | SMALL_TALK | SEARCH_CONTENT | RECOMMEND_LEARNING | REFINE_RESULTS",
  "target_types": ["POST" | "CHALLENGE"],
  "query": "short search keyword for database lookup",
  "filters": {{
    "challenge_type": "DSA | SQL | BACKEND | CONTEST | null",
    "difficulty": "EASY | MEDIUM | HARD | null",
    "topic": "string or null"
  }},
  "language": "en",
  "needs_cards": true
}}

Decision policy:
- If the user asks about real content available on WindFlow, use SEARCH_CONTENT.
- If the user wants to read, browse, view, open, see, find, or explore readable content, target POST.
- If the user wants to practice, solve, train, exercise, or find tasks/problems, target CHALLENGE.
- If the user asks what WindFlow has in general, target both POST and CHALLENGE.
- If the user asks what they should practice, what they are weak at, or wants personalized study suggestions, use RECOMMEND_LEARNING.
- If the user is refining previous results, such as disliking a topic, asking for easier/harder items, saying "not this", "not DSA", "I don't like that", use REFINE_RESULTS.
- If the user is only greeting, thanking, or making small talk, use SMALL_TALK.
- If the user asks a normal programming/theory question and is not asking for WindFlow website content, use GENERAL_CHAT.

Filter policy:
- Use challenge_type only when the user clearly refers to one of the supported challenge categories.
- SQL/database/query/join practice usually maps to challenge_type SQL.
- Algorithm/DSA/data structure practice usually maps to challenge_type DSA.
- Backend/API/server practice usually maps to challenge_type BACKEND.
- Contest/competition practice usually maps to challenge_type CONTEST.
- Put a concise topic in filters.topic when useful.
- Put a concise database keyword in query only when it helps search titles, descriptions, or topics.
- Do not put filler words in query.
- For broad browsing requests, query should be an empty string.
- language must always be "en".
- needs_cards must be true for SEARCH_CONTENT, RECOMMEND_LEARNING, and REFINE_RESULTS.
- needs_cards must be false for GENERAL_CHAT and SMALL_TALK.

Use the recent conversation only to resolve follow-up messages.

Recent conversation:
{json.dumps(recent_history, ensure_ascii=False)}

Current user message:
{message}
"""

    messages = [
        {
            "role": "system",
            "content": "You are a strict JSON API. Return only valid JSON."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    try:
        text = await call_groq(messages)
    except Exception:
        text = await call_openrouter(messages)

    parsed = extract_json_object(text)

    intent = parsed.get("intent")
    if intent not in [
        "GENERAL_CHAT",
        "SMALL_TALK",
        "SEARCH_CONTENT",
        "RECOMMEND_LEARNING",
        "REFINE_RESULTS"
    ]:
        intent = "GENERAL_CHAT"

    target_types = parsed.get("target_types")
    if not isinstance(target_types, list):
        target_types = []

    target_types = [
        item for item in target_types
        if item in ["POST", "CHALLENGE"]
    ]

    filters = parsed.get("filters")
    if not isinstance(filters, dict):
        filters = {}

    challenge_type = filters.get("challenge_type")
    if challenge_type not in ["DSA", "SQL", "BACKEND", "CONTEST"]:
        challenge_type = None

    difficulty = filters.get("difficulty")
    if difficulty not in ["EASY", "MEDIUM", "HARD"]:
        difficulty = None

    topic = filters.get("topic")
    if topic is not None:
        topic = str(topic).strip() or None

    query = str(parsed.get("query") or "").strip()
    needs_cards = bool(parsed.get("needs_cards"))

    if intent in ["SEARCH_CONTENT", "RECOMMEND_LEARNING", "REFINE_RESULTS"]:
        needs_cards = True

    if intent in ["GENERAL_CHAT", "SMALL_TALK"]:
        needs_cards = False

    if needs_cards and not target_types:
        target_types = ["POST", "CHALLENGE"]

    return {
        "intent": intent,
        "target_types": target_types,
        "query": query,
        "filters": {
            "challenge_type": challenge_type,
            "difficulty": difficulty,
            "topic": topic
        },
        "language": "en",
        "needs_cards": needs_cards
    }


async def select_response_cards(
    message: str,
    history: list | None = None,
    candidates: list | None = None,
    last_cards: list | None = None
):
    recent_history = normalize_history(history)
    normalized_candidates = normalize_cards(candidates, 40)
    normalized_last_cards = normalize_cards(last_cards, 20)

    prompt = f"""
You are the recommendation selector for WindFlow, an English-only programming forum.

Your job is to choose which real candidate cards should be shown to the user.

Important:
- You must select only from the provided candidates.
- Never invent cards.
- Never invent IDs.
- If the user expresses a negative preference, do not select cards that match that disliked topic/type.
- If the user says they want to read, prefer POST cards.
- If the user says they want to practice, solve, or train, prefer CHALLENGE cards.
- If the user asks for everything or broadly asks what is available, choose a useful mix of POST and CHALLENGE.
- If the user refines previous results, use last_cards and recent conversation to understand what they are reacting to.
- If there are enough relevant cards, select between 3 and 8 cards.
- If no candidate is relevant, return an empty selected_card_ids list.
- Reply must be short, friendly, and in English.
- Mention that the user can browse/click the cards only when selected_card_ids is not empty.

Return ONLY valid JSON:
{{
  "reply": "short assistant reply",
  "selected_card_ids": ["candidate id"],
  "reason": "brief internal reason"
}}

Recent conversation:
{json.dumps(recent_history, ensure_ascii=False)}

Last cards shown to the user:
{json.dumps(normalized_last_cards, ensure_ascii=False)}

Candidate cards:
{json.dumps(normalized_candidates, ensure_ascii=False)}

Current user message:
{message}
"""

    messages = [
        {
            "role": "system",
            "content": "You are a strict JSON API. Return only valid JSON."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    try:
        text = await call_groq(messages)
    except Exception:
        text = await call_openrouter(messages)

    parsed = extract_json_object(text)

    selected_card_ids = parsed.get("selected_card_ids")
    if not isinstance(selected_card_ids, list):
        selected_card_ids = []

    valid_ids = {card["id"] for card in normalized_candidates}

    selected_card_ids = [
        str(item)
        for item in selected_card_ids
        if str(item) in valid_ids
    ]

    reply = str(parsed.get("reply") or "").strip()

    if not reply:
        if selected_card_ids:
            reply = "I found some matching items from WindFlow. Browse the cards below and click one to open it."
        else:
            reply = "I couldn't find matching content in WindFlow for that request."

    return {
        "reply": reply,
        "selected_card_ids": selected_card_ids,
        "reason": str(parsed.get("reason") or "").strip()
    }


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