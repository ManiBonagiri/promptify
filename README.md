# Promptify 🎯

> Turn a simple idea into a stunning AI-generated image — automatically.

Promptify is a full-stack generative AI pipeline that transforms plain, lazy descriptions into rich, detailed prompts optimized for image generation — then generates the image instantly using Stable Diffusion XL.

## ✨ How It Works

```
User types a simple idea
        ↓
Fine-tuned GPT-2 + LoRA expands it into a rich prompt
        ↓
Stable Diffusion XL generates the image
        ↓
Image displayed + available to download
```

---

## 🧠 ML Stack

| Component | Details |
|---|---|
| **Base Model** | GPT-2 Medium |
| **Fine-tuning** | LoRA (PEFT) on DiffusionDB prompt pairs |
| **Training** | Google Colab (GPU) |
| **Image Generation** | Stable Diffusion XL via HuggingFace Inference API |

The model was trained on `(simple prompt → optimized prompt)` pairs derived from [DiffusionDB](https://huggingface.co/datasets/poloclub/diffusiondb) — millions of real prompts used by actual Stable Diffusion users.

---

## 🛠️ Tech Stack

**Backend**
- Python · FastAPI · HuggingFace Transformers
- PEFT / LoRA · PyTorch · Uvicorn

**Frontend**
- React · Vite · Plain CSS

**APIs**
- HuggingFace Inference API (SDXL image generation)

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- HuggingFace account with API token

### 1. Clone the repo
```bash
git clone https://github.com/ManiBonagiri/promptify.git
cd promptify
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```
HF_TOKEN=your_huggingface_token_here
```

> ⚠️ **Model weights** are not included in this repo (too large for GitHub).
> Download the fine-tuned adapter from [Releases](https://github.com/ManiBonagiri/promptify/releases) and place it at `backend/model/final/`.

Start the backend:
```bash
uvicorn main:app --reload
```
API runs at → `http://localhost:8000`

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
App runs at → `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/optimize` | Optimize a simple prompt |
| `POST` | `/generate-image` | Generate image from a prompt |

### Example
```bash
curl -X POST http://localhost:8000/optimize \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat on a rooftop at night"}'
```

```json
{
  "original": "a cat on a rooftop at night",
  "optimized": "a sleek black cat perched on a rain-slicked urban rooftop at midnight, city lights reflecting below, dramatic rim lighting, bokeh background, cinematic composition, 8k, photorealistic..."
}
```

---

## 📁 Project Structure

```
promptify/
├── backend/
│   ├── model/final/          # LoRA adapter weights (not in repo)
│   │   ├── adapter_config.json
│   │   ├── adapter_model.safetensors
│   │   └── tokenizer files
│   ├── main.py               # FastAPI app + endpoints
│   ├── model.py              # Model loading + inference
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── requirements.txt
│   └── .env                  # HF_TOKEN (not in repo)
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main UI component
    │   ├── App.css            # Styles
    │   └── main.jsx           # Entry point
    └── package.json
```

---

## 💡 Key Design Decisions

- **GPT-2 + LoRA over full fine-tuning** — LoRA adapters keep the model small (~8MB) while being highly effective for this task
- **HF Inference API for image gen** — avoids needing a GPU locally; SDXL runs in the cloud
- **Editable optimized prompt** — users can tweak the model's output before generating, giving them creative control
- **`repetition_penalty=1.3`** — prevents the model from looping repeated keywords, a common GPT-2 artifact

---



## 👤 Author

**Mani Bonagiri** — [GitHub](https://github.com/ManiBonagiri)

---

## 📄 License

MIT License — free to use, modify, and distribute.
