# scripts/universal_ingester.py
import os
import fitz # PyMuPDF
from docx import Document
from app.services.vector_db import add_knowledge_to_db

def read_pdf(path):
    doc = fitz.open(path)
    return [{"text": page.get_text(), "page": i+1} for i, page in enumerate(doc)]

def read_docx(path):
    doc = Document(path)
    full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    return [{"text": full_text, "page": "N/A"}]

def ingest_all(directory="data/raw_docs"):
    for root, dirs, files in os.walk(directory):
        category = os.path.basename(root) 
        
        for file in files:
            file_path = os.path.join(root, file)
            content = []
            
            if file.endswith(".pdf"):
                content = read_pdf(file_path)
            elif file.endswith(".docx"):
                content = read_docx(file_path)
            
            for item in content:
                metadata = {
                    "source": file,
                    "page": item["page"],
                    "category": category # Quan trọng để AI phân loại kiến thức
                }
                add_knowledge_to_db(item["text"], metadata)
    print("Done!")