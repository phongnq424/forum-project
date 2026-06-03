# app/services/moderation.py
from groq import AsyncGroq
from huggingface_hub import AsyncInferenceClient
import google.generativeai as genai
from PIL import Image
import io

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