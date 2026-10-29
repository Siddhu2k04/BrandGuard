import os
from typing import List, Tuple
from fastapi import HTTPException
from openai import OpenAI
import faiss
import numpy as np
from ..core.config import settings

# ---------- OpenAI client ----------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------- Helper – load (or create) per‑company FAISS index ----------
def _index_path(company_id: int) -> str:
    """Path on disk where the company’s index is persisted."""
    dir_path = os.path.join(settings.storage_dir, "faiss_indices")
    os.makedirs(dir_path, exist_ok=True)
    return os.path.join(dir_path, f"company_{company_id}.index")

def _load_index(company_id: int) -> Tuple[faiss.IndexFlatL2, List[dict]]:
    """Returns (faiss_index, metadatas). Metadatas is a list parallel to the vectors."""
    idx_path = _index_path(company_id)
    if os.path.exists(idx_path):
        index = faiss.read_index(idx_path)
        # metadata is stored alongside the index in a JSON file
        meta_path = idx_path + ".meta.json"
        import json, pathlib
        metas = json.loads(pathlib.Path(meta_path).read_text())
        return index, metas
    # no index yet → empty
    dim = 1536  # OpenAI text‑embedding‑3‑large dimension
    return faiss.IndexFlatL2(dim), []

def _save_index(company_id: int, index: faiss.IndexFlatL2, metas: List[dict]) -> None:
    idx_path = _index_path(company_id)
    faiss.write_index(index, idx_path)
    import json, pathlib
    pathlib.Path(idx_path + ".meta.json").write_text(json.dumps(metas, ensure_ascii=False))

# ---------- Embedding ----------
def embed_texts(texts: List[str]) -> np.ndarray:
    """Calls OpenAI embedding endpoint and returns a (N, D) numpy array."""
    try:
        resp = client.embeddings.create(
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-large"),
            input=texts,
        )
        vectors = np.array([item.embedding for item in resp.data])
        return vectors
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Embedding provider error: {exc}")

# ---------- Retrieval ----------
def retrieve(query: str, company_id: int, top_k: int = 5) -> List[dict]:
    """Return top‑k relevant chunks for *query* scoped to the company."""
    index, metas = _load_index(company_id)
    if index.ntotal == 0:
        return []
    q_vec = embed_texts([query])
    distances, ids = index.search(q_vec, top_k)
    results = []
    for dist, idx in zip(distances[0], ids[0]):
        if idx < 0:
            continue
        meta = metas[idx]
        meta["score"] = float(dist)
        results.append(meta)
    return results

# ---------- Generation ----------
def generate_answer(query: str, context_chunks: List[dict]) -> str:
    """Send context + user query to the LLM."""
    if not context_chunks:
        raise HTTPException(status_code=400, detail="No relevant guideline chunks found.")
    context_str = "\n---\n".join(
        f"Source: {c['title']}\nExcerpt: {c['text']}" for c in context_chunks
    )
    prompt = (
        f"You are a brand‑compliance assistant.\n"
        f"The user asks: {query}\n"
        f"Use the following extracted guideline excerpts to answer. Quote the source titles when appropriate.\n\n"
        f"{context_str}"
    )
    try:
        resp = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        return resp.choices[0].message.content.strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM provider error: {exc}")
