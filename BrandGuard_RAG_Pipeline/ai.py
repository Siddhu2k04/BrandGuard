from pathlib import Path
import os
from dotenv import load_dotenv
import sys

import chromadb
import ollama

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)
VISION_MODEL = os.getenv("VISION_MODEL", "moondream")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
CHROMA_DIR = BASE_DIR / os.getenv("CHROMA_DIR", "data/chroma_db")
COLLECTION_NAME = "brand_guidelines"

client = chromadb.PersistentClient(path=str(CHROMA_DIR))


def embed(text: str):
    result = ollama.embed(model=EMBED_MODEL, input=text)
    return result["embeddings"][0]


def retrieve_guidelines(query: str, top_k: int = 4):
    try:
        collection = client.get_collection(COLLECTION_NAME)
    except Exception:
        return []

    if collection.count() == 0:
        return []

    result = collection.query(
        query_embeddings=[embed(query)],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    found = []
    docs = (result.get("documents") or [[]])[0]
    metas = (result.get("metadatas") or [[]])[0]
    distances = (result.get("distances") or [[]])[0]

    for text, metadata, distance in zip(docs, metas, distances):
        found.append({
            "text": text,
            "source": metadata.get("source", "unknown"),
            "distance": distance,
        })
    return found


def image_prompt(image_path: Path, guidelines):
    if guidelines:
        evidence = "\n\n".join(
            f"[Source: {item['source']} | similarity distance: {item['distance']:.3f}]\n"
            f"{item['text']}"
            for item in guidelines
        )
    else:
        evidence = (
            "No indexed brand guidelines were retrieved. "
            "Do not claim compliance or non-compliance with specific brand rules."
        )

    return f"""
You are BrandGuard, an assistant that reviews advertisement images against
approved brand guidelines retrieved from the organization's knowledge base.

TASK:
Inspect the attached image and compare only relevant visible evidence against
the retrieved guideline excerpts below.

RETRIEVED BRAND GUIDELINES:
{evidence}

OUTPUT:
1. Summary
2. Visible brand/logo observations
3. Guideline checks (PASS / POSSIBLE ISSUE / CANNOT VERIFY)
4. Findings with the relevant source filename and a short supporting quote
5. Suggested fixes
6. Human review required: Yes/No, with reason

RULES:
- Use only the supplied excerpts as the source of official brand requirements.
- Cite source filenames for guideline-based findings.
- Do not invent guidelines, logo colors, or brand facts.
- If a requirement cannot be verified from the image, say CANNOT VERIFY.
- Visual similarity alone does not prove authenticity or fraud.
- Separate direct visual observations from guideline-based conclusions.
- If no guidelines were retrieved, provide visual observations only and state
  that brand compliance could not be evaluated.
"""


def analyze_image(image_path=None):
    if image_path is None:
        image_path = BASE_DIR / "brand_ad.png"

    image_path = Path(image_path).expanduser()
    if not image_path.is_absolute():
        image_path = BASE_DIR / image_path
    image_path = image_path.resolve()

    if not image_path.exists() or not image_path.is_file():
        return f"IMAGE ERROR: Image not found: {image_path}"

    if image_path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
        return "IMAGE ERROR: Use PNG, JPG, JPEG, or WEBP."

    # A short textual query helps retrieve relevant rules before vision analysis.
    retrieval_query = (
        "Review advertisement for logo use, approved colors, typography, "
        "brand voice, claims, disclaimers, and visual consistency."
    )

    try:
        guidelines = retrieve_guidelines(retrieval_query, top_k=4)
        prompt = image_prompt(image_path, guidelines)

        response = ollama.chat(
            model=VISION_MODEL,
            messages=[{
                "role": "user",
                "content": prompt,
                "images": [str(image_path)],
            }],
        )

        return response["message"]["content"]

    except Exception as exc:
        return (
            f"ERROR: {type(exc).__name__}: {exc}\n"
            "Check that Ollama is running and both required models are installed. "
            "Run: ollama pull moondream and ollama pull nomic-embed-text"
        )


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else str(BASE_DIR / "brand_ad.png")
    print("\n========== BRANDGUARD RAG ANALYSIS ==========\n")
    print(analyze_image(target))
    print("\n=============================================\n")
