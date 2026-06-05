# app/services/vector_db.py
import chromadb
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.embedding import get_embedding

chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="forum_knowledge")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

MAX_DISTANCE_THRESHOLD = 1.05


def add_knowledge_to_db(text: str, metadata: dict):
    chunks = text_splitter.split_text(text)

    documents = []
    embeddings = []
    metadatas = []
    ids = []

    for chunk in chunks:
        normalized_chunk = chunk.strip()

        if not normalized_chunk:
            continue

        documents.append(normalized_chunk)
        embeddings.append(get_embedding(normalized_chunk))
        metadatas.append(metadata)
        ids.append(str(uuid.uuid4()))

    if documents:
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    return len(documents)


def search_relevant_context(
    query: str,
    n_results: int = 6,
    max_distance: float = MAX_DISTANCE_THRESHOLD
):
    normalized_query = (query or "").strip()

    if not normalized_query:
        return {
            "has_context": False,
            "context": "",
            "sources": [],
            "best_distance": None
        }

    query_vector = get_embedding(normalized_query)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    if not documents:
        return {
            "has_context": False,
            "context": "",
            "sources": [],
            "best_distance": None
        }

    filtered_items = []

    for doc, meta, distance in zip(documents, metadatas, distances):
        if distance is None:
            continue

        if float(distance) <= max_distance:
            filtered_items.append({
                "document": doc,
                "metadata": meta or {},
                "distance": float(distance)
            })

    if not filtered_items:
        return {
            "has_context": False,
            "context": "",
            "sources": [],
            "best_distance": float(distances[0]) if distances else None
        }

    internal_info = []
    tech_info = []
    sources = []

    for item in filtered_items:
        doc = item["document"]
        meta = item["metadata"]
        distance = item["distance"]

        source = meta.get("source", "N/A")
        page = meta.get("page", "N/A")
        category = meta.get("category", "unknown")

        content = f"[Source: {source}, Page: {page}, Distance: {distance:.4f}] {doc}"

        sources.append({
            "source": source,
            "page": page,
            "category": category,
            "distance": distance
        })

        if "internal" in str(category).lower():
            internal_info.append(content)
        else:
            tech_info.append(content)

    context_output = ""

    if internal_info:
        context_output += "=== THÔNG TIN NỘI BỘ / DỰ ÁN ===\n"
        context_output += "\n".join(internal_info)

    if tech_info:
        if context_output:
            context_output += "\n\n"

        context_output += "=== KIẾN THỨC KỸ THUẬT / LÝ THUYẾT ===\n"
        context_output += "\n".join(tech_info)

    return {
        "has_context": True,
        "context": context_output,
        "sources": sources,
        "best_distance": filtered_items[0]["distance"]
    }