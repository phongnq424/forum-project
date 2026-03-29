# app/services/moderation.py
from groq import Groq
from huggingface_hub import InferenceClient
import google.generativeai as genai
from PIL import Image
import io

from core.config import settings

# Khởi tạo client 1 lần ở ngoài (tiết kiệm tài nguyên)
groq_client = Groq(api_key=settings.GROQ_API_KEY)
hf_client = InferenceClient(token=settings.HF_TOKEN)
genai.configure(api_key=settings.GEMINI_API_KEY)

async def moderate_text(text: str):
    try:
        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-safeguard-20b",
            messages=[{"role": "user", "content": text}]
        )
        result = completion.choices[0].message.content
        if "unsafe" in result.lower():
            return {"is_safe": False, "source": "groq_llama_guard"}
        return {"is_safe": True, "source": "groq_llama_guard"}
        
    except Exception as e:
        print(f"Groq Text Mod failed: {e}. Fallback to HF...")

    try:
        response = hf_client.text_classification(text, model="unitary/toxic-bert")
        is_toxic = any(r['label'] == 'toxic' and r['score'] > 0.7 for r in response)
        return {"is_safe": not is_toxic, "source": "hf_toxic_bert"}
        
    except Exception as e:
        print(f"HF Text Mod failed: {e}")
        
    return {"is_safe": False, "source": "default_strict"}

async def moderate_image(image_bytes: bytes):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Chuyển bytes thành ảnh cho Gemini hiểu
        img = Image.open(io.BytesIO(image_bytes)) 
        response = model.generate_content(["Is this image safe? Answer 'safe' or 'unsafe'.", img])
        
        if "unsafe" in response.text.lower():
            return False
        return True
    except Exception as e:
        print(f"Gemini Image Mod failed: {e}. Fallback to HF...")
        
        try:
            # Fallback gọi model HF kiểm duyệt ảnh
            response = hf_client.image_classification(image_bytes, model="Falconsai/nsfw_image_detection")
            # response trả về list dict, vd: [{'label': 'nsfw', 'score': 0.9}, ...]
            is_nsfw = any(r['label'] == 'nsfw' and r['score'] > 0.6 for r in response)
            return not is_nsfw
        except Exception as fallback_e:
            print(f"HF Image Mod failed: {fallback_e}")
            return False