# app/services/vector_db.py
import chromadb
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.embedding import get_embedding

# 1. Khởi tạo Database lưu tại thư mục data/chroma_db
chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="forum_knowledge")

# 2. Cấu hình bộ cắt chữ (Tránh nhồi đoạn text quá dài)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, 
    chunk_overlap=50 
)

def add_knowledge_to_db(text: str,  metadata: dict):
    chunks = text_splitter.split_text(text)
    
    documents = []
    embeddings = []
    metadatas = []
    ids = []
    
    for chunk in chunks:
        documents.append(chunk)
        embeddings.append(get_embedding(chunk))
        metadatas.append(metadata)
        ids.append(str(uuid.uuid4()))
        
    # Lưu vào ChromaDB
    if documents:
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
    return len(chunks)

def search_relevant_context(query: str, n_results: int = 6):
    query_vector = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )
    
    if not results['documents'] or not results['documents'][0]:
        return ""
    internal_info = []
    tech_info = []
    # results['metadatas'] sẽ chứa list các dict metadata tương ứng
    for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
        source = meta.get("source", "N/A")
        category = meta.get("category", "unknown")
        content = f"[Source: {source}] {doc}"
        if "internal" in category:
            internal_info.append(content)
        else:
            tech_info.append(content)
    
    context_output = "=== THÔNG TIN NỘI BỘ / DỰ ÁN (ƯU TIÊN) ===\n"
    context_output += "\n".join(internal_info) if internal_info else "Not found internal info."        
    context_output += "\n\n=== KIẾN THỨC KỸ THUẬT / LÝ THUYẾT ===\n"
    context_output += "\n".join(tech_info) if tech_info else "Not found technical info."
    return context_output