from pathlib import Path
import os
from dotenv import load_dotenv
import hashlib

import chromadb
import ollama
from pypdf import PdfReader
from docx import Document

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)
GUIDELINES_DIR = BASE_DIR / os.getenv("GUIDELINES_DIR", "brand_guidelines")
CHROMA_DIR = BASE_DIR / os.getenv("CHROMA_DIR", "data/chroma_db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
COLLECTION_NAME = "brand_guidelines"

SUPPORTED = {".txt", ".md", ".pdf", ".docx"}


def read_document(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        doc = Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs)
    return ""


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150):
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        # Prefer ending on a sentence/space when close to the chunk boundary.
        if end < len(text):
            candidate = max(text.rfind(". ", start, end), text.rfind("\n", start, end))
            if candidate > start + int(chunk_size * 0.6):
                end = candidate + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks


def embed(text: str):
    result = ollama.embed(model=EMBED_MODEL, input=text)
    return result["embeddings"][0]


def main():
    if not GUIDELINES_DIR.exists():
        GUIDELINES_DIR.mkdir(parents=True, exist_ok=True)

    documents = []
    for path in GUIDELINES_DIR.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED:
            if path.name.lower() == "readme.md":
                continue
            text = read_document(path)
            for index, chunk in enumerate(chunk_text(text)):
                documents.append({
                    "id": hashlib.sha256(
                        f"{path.relative_to(GUIDELINES_DIR)}:{index}:{chunk}".encode("utf-8")
                    ).hexdigest(),
                    "text": chunk,
                    "source": str(path.relative_to(GUIDELINES_DIR)),
                    "chunk": index,
                })

    if not documents:
        print(f"No guideline text found in: {GUIDELINES_DIR}")
        print("Add .txt, .md, .pdf, or .docx files, then run this script again.")
        return

    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    print(f"Found {len(documents)} guideline chunks. Embedding locally with {EMBED_MODEL}...")
    # Upsert makes re-running ingestion safe; old chunks from changed/deleted files
    # remain until the collection is rebuilt, so delete/recreate for a clean refresh.
    existing = [item["id"] for item in documents]
    for start in range(0, len(documents), 16):
        batch = documents[start:start + 16]
        embeddings = [embed(item["text"]) for item in batch]
        collection.upsert(
            ids=[item["id"] for item in batch],
            documents=[item["text"] for item in batch],
            embeddings=embeddings,
            metadatas=[
                {"source": item["source"], "chunk": item["chunk"]}
                for item in batch
            ],
        )
        print(f"Indexed {min(start + len(batch), len(documents))}/{len(documents)} chunks")

    print(f"Done. Collection '{COLLECTION_NAME}' stored at {CHROMA_DIR}")


if __name__ == "__main__":
    main()
