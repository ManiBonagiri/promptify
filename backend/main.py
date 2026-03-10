# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from schemas import PromptRequest, PromptResponse, ImageRequest
from model import optimize_prompt
import os
import base64
from io import BytesIO
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

app = FastAPI(title="Promptify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def root():
    return {"status": "Promptify API is running 🚀"}

@app.post("/optimize", response_model=PromptResponse)
def optimize(req: PromptRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    optimized = optimize_prompt(req.prompt)
    return PromptResponse(original=req.prompt, optimized=optimized)

@app.post("/generate-image")
def generate_image(req: ImageRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=500, detail="HF_TOKEN not set in .env")
    try:
        client = InferenceClient(token=HF_TOKEN)
        image = client.text_to_image(
            req.prompt,
            model="stabilityai/stable-diffusion-xl-base-1.0",
        )
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "message": "Image generated successfully ✅",
            "prompt_used": req.prompt,
            "image_base64": img_base64,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Serve React frontend ──────────────────────────────────────
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")