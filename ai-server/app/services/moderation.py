# app/services/moderation.py
from groq import AsyncGroq
from huggingface_hub import AsyncInferenceClient
import google.generativeai as genai
from PIL import Image
import io

import json
import re
from core.config import settings

# Khởi tạo client 1 lần ở ngoài (tiết kiệm tài nguyên)
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
hf_client = AsyncInferenceClient(token=settings.HF_TOKEN)
genai.configure(api_key=settings.GEMINI_API_KEY)

async def moderate_text(text: str):
    normalized = (text or "").strip()

    if not normalized:
        return {
            "is_safe": True,
            "source": "empty_text",
            "category": "none",
            "reason": ""
        }

    try:
        completion = await groq_client.chat.completions.create(
            model="openai/gpt-oss-safeguard-20b",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a strict Vietnamese social forum moderation classifier.

Classify the user's text as SAFE or UNSAFE.

Mark UNSAFE if the text contains any of these:
- insults, humiliation, verbal abuse, or personal attacks
- harassment or bullying
- threats or intimidation
- hate speech against protected groups
- sexual harassment or explicit sexual content
- encouragement of self-harm or violence
- scams, phishing, or requests for passwords/OTP/tokens

Important:
Vietnamese insults such as "ngu", "rác rưởi", "vô dụng", "cút", "biến đi", "đồ chó", "đồ ngu" are UNSAFE when used to attack a person.

Return only one word:
SAFE
or
UNSAFE
"""
                },
                {
                    "role": "user",
                    "content": normalized
                }
            ],
            temperature=0
        )

        result = completion.choices[0].message.content.strip().upper()

        if result == "UNSAFE" or "UNSAFE" in result:
            return {
                "is_safe": False,
                "source": "groq_safeguard",
                "category": "harassment_or_toxicity",
                "reason": "Detected unsafe abusive or harassing language"
            }

        if result == "SAFE" or "SAFE" in result:
            return {
                "is_safe": True,
                "source": "groq_safeguard",
                "category": "safe",
                "reason": ""
            }

        return {
            "is_safe": False,
            "source": "groq_safeguard_unclear",
            "category": "unclear",
            "reason": f"Unclear moderation output: {result}"
        }

    except Exception as e:
        print(f"Groq Text Mod failed: {e}. Fallback to HF...")

    try:
        response = await hf_client.text_classification(
            normalized,
            model="unitary/toxic-bert"
        )

        labels = response
        if labels and isinstance(labels[0], list):
            labels = labels[0]

        toxic_labels = {
            "toxic",
            "insult",
            "threat",
            "identity_hate",
            "obscene",
            "severe_toxic"
        }

        is_toxic = any(
            str(r.get("label", "")).lower() in toxic_labels
            and float(r.get("score", 0)) > 0.55
            for r in labels
        )

        return {
            "is_safe": not is_toxic,
            "source": "hf_toxic_bert",
            "category": "toxic" if is_toxic else "safe",
            "reason": "Detected by toxic-bert fallback" if is_toxic else ""
        }

    except Exception as e:
        print(f"HF Text Mod failed: {e}")

    return {
        "is_safe": False,
        "source": "default_strict",
        "category": "moderation_unavailable",
        "reason": "All moderation providers failed"
    }

def extract_json_array(text: str):
    cleaned = (text or "").strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\[[\s\S]*\]", cleaned)

        if not match:
            raise ValueError("No JSON array found in AI response")

        return json.loads(match.group(0))


async def moderate_text_batch(items: list):
    normalized_items = []

    for item in items:
        item_id = str(item.get("id", "")).strip()
        content = str(item.get("content", "") or "").strip()

        if item_id:
            normalized_items.append({
                "id": item_id,
                "content": content
            })

    if not normalized_items:
        return []

    empty_results = []
    non_empty_items = []

    for item in normalized_items:
        if not item["content"]:
            empty_results.append({
                "id": item["id"],
                "is_safe": True,
                "source": "empty_text",
                "category": "none",
                "reason": ""
            })
        else:
            non_empty_items.append(item)

    if not non_empty_items:
        return empty_results

    try:
        completion = await groq_client.chat.completions.create(
            model="openai/gpt-oss-safeguard-20b",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a strict Vietnamese social forum moderation classifier.

Classify each item as SAFE or UNSAFE.

Mark UNSAFE if the text contains any of these:
- insults, humiliation, verbal abuse, or personal attacks
- harassment or bullying
- threats or intimidation
- hate speech against protected groups
- sexual harassment or explicit sexual content
- encouragement of self-harm or violence
- scams, phishing, spam, or requests for passwords/OTP/tokens
- instructions to attack, bypass, or harm systems

Important:
Vietnamese insults such as "ngu", "rác rưởi", "vô dụng", "cút", "biến đi", "đồ chó", "đồ ngu" are UNSAFE when used to attack a person.

Return ONLY valid JSON array.
Do not return markdown.
Do not explain outside JSON.

JSON schema:
[
  {
    "id": "same id from input",
    "is_safe": true
  }
]
"""
                },
                {
                    "role": "user",
                    "content": json.dumps(non_empty_items, ensure_ascii=False)
                }
            ],
            temperature=0
        )

        raw_text = completion.choices[0].message.content
        parsed = extract_json_array(raw_text)

        result_map = {}

        for item in parsed:
            item_id = str(item.get("id", "")).strip()
            is_safe = bool(item.get("is_safe", True))

            if item_id:
                result_map[item_id] = {
                    "id": item_id,
                    "is_safe": is_safe,
                    "source": "groq_safeguard_batch",
                    "category": "safe" if is_safe else "harassment_or_toxicity",
                    "reason": ""
                }

        results = []

        for item in normalized_items:
            if item["id"] in result_map:
                results.append(result_map[item["id"]])
            else:
                single_result = await moderate_text(item["content"])
                results.append({
                    "id": item["id"],
                    **single_result
                })

        return results

    except Exception as e:
        print(f"Groq Batch Text Mod failed: {e}. Fallback to single moderation...")

    results = []

    for item in normalized_items:
        single_result = await moderate_text(item["content"])
        results.append({
            "id": item["id"],
            **single_result
        })

    return results
async def moderate_image(image_bytes: bytes):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        # Chuyển bytes thành ảnh cho Gemini hiểu
        img = Image.open(io.BytesIO(image_bytes)) 
        response = await model.generate_content_async([
            """
You are a strict image safety classifier for a public student programming forum.

Classify the image as UNSAFE if it contains:
- explicit adult content
- nudity or sexualized content
- graphic violence
- hate symbols
- self-harm content
- illegal drugs
- weapons or dangerous objects used threateningly
- sword, gun, knife, bomb, etc.

Return only one word:
SAFE
or
UNSAFE
""",
            img
        ])
        
        if "unsafe" in response.text.lower():
            return False
        return True
    except Exception as e:
        print(f"Gemini Image Mod failed: {e}. Fallback to HF...")
        
        try:
            # Fallback gọi model HF kiểm duyệt ảnh
            response = await hf_client.image_classification(image_bytes, model="Falconsai/nsfw_image_detection")
            # response trả về list dict, vd: [{'label': 'nsfw', 'score': 0.9}, ...]
            is_nsfw = any(r['label'] == 'nsfw' and r['score'] > 0.6 for r in response)
            return not is_nsfw
        except Exception as fallback_e:
            print(f"HF Image Mod failed: {fallback_e}")
            return False