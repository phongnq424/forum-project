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
    chunk_size=500, # Mỗi đoạn khoảng 500 ký tự
    chunk_overlap=50 # Các đoạn gối lên nhau 50 ký tự để không mất ngữ cảnh
)

def add_knowledge_to_db(text: str, source_name: str = "manual"):
    chunks = text_splitter.split_text(text)
    
    documents = []
    embeddings = []
    metadatas = []
    ids = []
    
    for chunk in chunks:
        documents.append(chunk)
        embeddings.append(get_embedding(chunk)) # Biến chunk thành vector
        metadatas.append({"source": source_name})
        ids.append(str(uuid.uuid4())) # Tạo ID ngẫu nhiên
        
    # Lưu vào ChromaDB
    if documents:
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
    return len(chunks)

def search_relevant_context(query: str, n_results: int = 3):
    """Hàm để tìm kiếm thông tin khi User hỏi"""
    query_vector = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )
    
    if not results['documents'] or not results['documents'][0]:
        return ""
        
    # Gộp các đoạn tìm được thành 1 chuỗi dài
    return "\n---\n".join(results['documents'][0])