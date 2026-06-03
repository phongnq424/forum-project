import json
import re
from groq import AsyncGroq
import google.generativeai as genai
from core.config import settings

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
genai.configure(api_key=settings.GEMINI_API_KEY)

VALID_MISTAKE_TYPES = {
    "SYNTAX_ERROR",
    "RUNTIME_ERROR",
    "TIME_LIMIT",
    "MEMORY_LIMIT",
    "WRONG_ANSWER",
    "LOGIC_ERROR",
    "EDGE_CASE",
    "INPUT_OUTPUT_FORMAT",
    "PARTIAL_SOLUTION",
    "UNKNOWN"
}

VALID_MISTAKE_LEVELS = {
    "LOW",
    "MEDIUM",
    "HIGH"
}


def safe_text(value, max_length=6000):
    if value is None:
        return ""
    return str(value)[:max_length]


def extract_json_object(text):
    if not text:
        raise ValueError("Empty AI response")

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```json", "", cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"^```", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise ValueError("No JSON object found in AI response")
        return json.loads(match.group(0))


def normalize_topics(ai_topics, available_topics):
    available_by_id = {}
    available_by_slug = {}
    available_by_name = {}

    for topic in available_topics:
        topic_id = topic.get("id")
        slug = topic.get("slug")
        name = topic.get("name")

        if topic_id:
            available_by_id[str(topic_id)] = topic
        if slug:
            available_by_slug[str(slug).lower()] = topic
        if name:
            available_by_name[str(name).lower()] = topic

    results = []
    seen = set()

    if isinstance(ai_topics, list):
        for item in ai_topics:
            matched = None

            if isinstance(item, str):
                key = item.strip().lower()
                matched = (
                    available_by_id.get(item.strip())
                    or available_by_slug.get(key)
                    or available_by_name.get(key)
                )

            if isinstance(item, dict):
                topic_id = item.get("topic_id") or item.get("id")
                slug = item.get("slug")
                name = item.get("name")

                if topic_id:
                    matched = available_by_id.get(str(topic_id))
                if not matched and slug:
                    matched = available_by_slug.get(str(slug).lower())
                if not matched and name:
                    matched = available_by_name.get(str(name).lower())

            if matched and matched.get("id") not in seen:
                seen.add(matched.get("id"))
                results.append({
                    "topic_id": matched.get("id"),
                    "name": matched.get("name"),
                    "slug": matched.get("slug")
                })

    if not results:
        for topic in available_topics[:3]:
            topic_id = topic.get("id")
            if topic_id and topic_id not in seen:
                seen.add(topic_id)
                results.append({
                    "topic_id": topic_id,
                    "name": topic.get("name"),
                    "slug": topic.get("slug")
                })

    return results


def build_submission_prompt(payload):
    challenge = payload.get("challenge") or {}
    language = payload.get("language") or {}
    testcase_results = payload.get("testcaseResults") or []
    challenge_topics = challenge.get("topics") or []

    visible_testcases = []
    for item in testcase_results[:20]:
        visible_testcases.append({
            "status": item.get("status"),
            "score": item.get("score"),
            "maxScore": item.get("maxScore"),
            "message": safe_text(item.get("message"), 500),
            "stdout": safe_text(item.get("stdout"), 500),
            "stderr": safe_text(item.get("stderr"), 500),
            "testcase": item.get("testcase")
        })

    data = {
        "submissionId": payload.get("submissionId"),
        "judgeStatus": payload.get("judgeStatus"),
        "score": payload.get("score"),
        "runtime_ms": payload.get("runtime_ms"),
        "memory_kb": payload.get("memory_kb"),
        "error_message": safe_text(payload.get("error_message"), 1000),
        "language": language,
        "kind": payload.get("kind"),
        "code": safe_text(payload.get("code"), 8000),
        "challenge": {
            "id": challenge.get("id"),
            "title": challenge.get("title"),
            "description": safe_text(challenge.get("description"), 3000),
            "input": safe_text(challenge.get("input"), 1000),
            "output": safe_text(challenge.get("output"), 1000),
            "constraints": safe_text(challenge.get("constraints"), 1000),
            "difficulty": challenge.get("difficulty"),
            "type": challenge.get("type"),
            "topics": challenge_topics
        },
        "testcaseResults": visible_testcases
    }

    return f"""
You are an AI programming submission analyzer.

Analyze the student's submission based on judge result, code, challenge statement, and testcase results.

Return ONLY valid JSON. Do not use markdown.

The JSON schema must be:
{{
  "summary": "short English summary",
  "mistake_type": "SYNTAX_ERROR | RUNTIME_ERROR | TIME_LIMIT | MEMORY_LIMIT | WRONG_ANSWER | LOGIC_ERROR | EDGE_CASE | INPUT_OUTPUT_FORMAT | PARTIAL_SOLUTION | UNKNOWN",
  "mistake_level": "LOW | MEDIUM | HIGH",
  "explanation": "English explanation of why the submission failed or what can be improved",
  "suggestion": "English concrete suggestion for the student",
  "confidence": 0.0,
  "topics": [
    {{
      "topic_id": "must match one id from challenge.topics if possible",
      "name": "topic name",
      "slug": "topic slug"
    }}
  ],
  "model_name": "model name",
  "prompt_version": "submission-analysis-v1"
}}

Rules:
- Follow this diagnosis order strictly:
  1. First inspect judgeStatus, error_message, and testcaseResults.stderr/message.
  2. If judgeStatus is CE, the primary issue must be a compile/build/runtime-selection issue, not an algorithmic or SQL logic issue.
  3. If stderr mentions that a keyword or token "does not name a type", "expected", "syntax error", "not declared", or similar compiler messages, explain the compiler-level cause first.
  4. If the submitted code looks like SQL but the selected language/runtime is C++, Java, Python, JavaScript, or another non-SQL runtime, explain that the SQL query was submitted under the wrong runtime/language and was compiled/interpreted as source code.
  5. If challenge.type is SQL and language.code is not a SQL runtime, classify the issue as INPUT_OUTPUT_FORMAT or SYNTAX_ERROR, with HIGH confidence.
  6. Do not analyze SQL query correctness until the submission is actually executed by a SQL engine.
  7. Do not say the SQL condition/subquery/order is wrong if the error is caused before SQL execution.
  8. Only analyze algorithmic/logic/edge-case mistakes when the code compiled/executed and produced WA, PARTIAL, TLE, MLE, or RE.
- If judgeStatus is ACCEPTED, still give a useful learning summary and improvement suggestion.
- Only choose topics from challenge.topics when possible.
- Do not invent database IDs.
- The answer must be English.
- Keep explanation and suggestion clear, practical, and not too long.

Submission data:
{json.dumps(data, ensure_ascii=False)}
"""


def normalize_result(result, payload, model_name):
    challenge = payload.get("challenge") or {}
    available_topics = challenge.get("topics") or []

    mistake_type = result.get("mistake_type") or "UNKNOWN"
    mistake_level = result.get("mistake_level") or "LOW"

    if mistake_type not in VALID_MISTAKE_TYPES:
        mistake_type = "UNKNOWN"

    if mistake_level not in VALID_MISTAKE_LEVELS:
        mistake_level = "LOW"

    confidence = result.get("confidence")
    if not isinstance(confidence, (int, float)):
        confidence = None
    else:
        confidence = max(0, min(1, float(confidence)))

    return {
        "success": True,
        "summary": result.get("summary") or "Submission analyzed.",
        "mistake_type": mistake_type,
        "mistake_level": mistake_level,
        "explanation": result.get("explanation"),
        "suggestion": result.get("suggestion"),
        "confidence": confidence,
        "topics": normalize_topics(result.get("topics"), available_topics),
        "model_name": result.get("model_name") or model_name,
        "prompt_version": result.get("prompt_version") or "submission-analysis-v1"
    }


async def analyze_submission_mistake(payload):
    prompt = build_submission_prompt(payload)

    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict JSON API. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        text = response.choices[0].message.content
        parsed = extract_json_object(text)
        return normalize_result(parsed, payload, "llama-3.1-8b-instant")

    except Exception as groq_error:
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")

            response = await model.generate_content_async(
                [
                    "You are a strict JSON API. Return only valid JSON.",
                    prompt
                ],
                generation_config={
                    "temperature": 0.2,
                    "response_mime_type": "application/json"
                }
            )

            text = response.text
            parsed = extract_json_object(text)
            return normalize_result(parsed, payload, "gemini-2.5-flash")

        except Exception as gemini_error:
            raise Exception(
                f"Groq failed: {str(groq_error)} | Gemini failed: {str(gemini_error)}"
            )