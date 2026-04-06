import json
import os
import pathlib
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")

ROOT = pathlib.Path(__file__).parent.parent
RESULTS_PATH = ROOT / "results" / "results.json"
DATASET_PATH = ROOT / "data" / "train.jsonl"

_results: dict = {}
_dataset: list = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _results, _dataset

    if RESULTS_PATH.exists():
        _results = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))
    else:
        _results = {}

    if DATASET_PATH.exists():
        _dataset = [
            json.loads(line)
            for line in DATASET_PATH.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
    else:
        _dataset = []

    print(f"[startup] results loaded: {bool(_results)}")
    print(f"[startup] dataset loaded: {len(_dataset)} examples")
    yield


app = FastAPI(title="Fine-Tuner Lab API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    model = _results.get("meta", {}).get("base_model", "unknown")
    return {"status": "ok", "model": model, "dataset_size": len(_dataset)}


@app.get("/results")
def results():
    if not _results:
        raise HTTPException(503, "results.json not found. Run the Colab notebook first.")
    return _results


@app.get("/dataset")
def dataset(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=80),
):
    if not _dataset:
        raise HTTPException(503, "train.jsonl not found.")
    start = (page - 1) * size
    end = start + size
    return {
        "total": len(_dataset),
        "page": page,
        "size": size,
        "items": _dataset[start:end],
    }


class QueryRequest(BaseModel):
    prompt: str
    model: Optional[str] = None  # defaults to adapter_repo from meta


@app.post("/query")
async def query_live(req: QueryRequest):
    if not req.prompt.strip():
        raise HTTPException(400, "Prompt cannot be empty.")

    adapter_repo = req.model or _results.get("meta", {}).get("adapter_repo", "")
    if not adapter_repo or adapter_repo == "your-username/qwen25-green-neko-genz":
        raise HTTPException(
            503,
            "No HuggingFace adapter repo configured. Push your adapter to HF Hub first "
            "and update meta.adapter_repo in results.json.",
        )

    if not HF_TOKEN:
        raise HTTPException(503, "HF_TOKEN environment variable not set.")

    hf_url = f"https://api-inference.huggingface.co/models/{adapter_repo}"
    payload = {
        "inputs": f"### Instruction:\n{req.prompt}\n\n### Response:\n",
        "parameters": {"max_new_tokens": 200, "do_sample": False},
    }
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(hf_url, json=payload, headers=headers)

    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"HuggingFace API error: {resp.text}")

    data = resp.json()
    generated = data[0].get("generated_text", "") if isinstance(data, list) else str(data)
    # Strip the prompt prefix if echoed back
    marker = "### Response:\n"
    if marker in generated:
        generated = generated.split(marker, 1)[-1].strip()

    return {"output": generated, "model": adapter_repo}
