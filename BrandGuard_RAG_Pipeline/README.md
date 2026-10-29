# BrandGuard — Local RAG + Vision Pipeline

This starter project runs locally with Ollama. It does not call Hugging Face Inference Providers and does not require an API token.

## Pipeline

1. Add approved brand guideline documents to `brand_guidelines/`.
2. `ingest.py` extracts text from TXT, Markdown, PDF, and DOCX files.
3. Text is split into overlapping chunks.
4. `nomic-embed-text` creates local embeddings.
5. ChromaDB stores the chunks in `data/chroma_db/`.
6. `ai.py` retrieves relevant guideline chunks and sends the image plus those excerpts to `moondream`.
7. The vision model returns findings with source filenames and uncertainty labels.

## Requirements

- Windows/macOS/Linux
- Python 3.10+
- Ollama installed and running
- About 5 GB of free disk space is a practical starting point, though model and package sizes vary
- 8 GB RAM may work with lightweight models, but performance depends on your system and image size

## Setup (Windows PowerShell)

From this folder:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
ollama pull moondream
ollama pull nomic-embed-text
```

If PowerShell blocks activation, use `.\.venv\Scripts\python.exe` for the commands below, or follow your system's policy for activating virtual environments.

## Add your actual guidelines

Copy your organization's approved rules into `brand_guidelines/` as `.txt`, `.md`, `.pdf`, or `.docx`.

The included `sample_brand_guidelines.md` is only a placeholder example. Replace it with your actual rules before relying on compliance results.

## Build / refresh the knowledge base

```powershell
python ingest.py
```

The first run downloads/uses the local embedding model and can take a while. Run ingestion again after editing guidelines.

For a completely clean rebuild, delete `data/chroma_db/` and run `python ingest.py` again. This also removes previously indexed chunks for files that were deleted or changed.

## Analyze an image

Place `brand_ad.png` in this folder and run:

```powershell
python ai.py
```

Or pass an image path:

```powershell
python ai.py "C:\path\to\advertisement.png"
```

## Environment settings (optional)

Copy `.env.example` to `.env` and adjust model names or directories if needed. Both scripts load `.env` automatically.

## Important limitations

- Retrieval quality depends on the quality and specificity of the approved guidelines.
- Moondream is a lightweight vision model; detailed OCR, fine logo differences, and complex policy decisions may need human review.
- This starter retrieves the same general set of guideline passages for each image. For higher precision, add OCR/captioning first and use those extracted image details to form a more specific retrieval query.
- It is not proof of authenticity or legal compliance. Human review is recommended before publication.
