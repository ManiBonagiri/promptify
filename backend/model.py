# model.py
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import os

BASE_MODEL   = "gpt2-medium"
ADAPTER_PATH = os.path.join(os.path.dirname(__file__), "model", "final")

INSTRUCTION = (
    "You are an expert at writing prompts for AI image generation. "
    "Given a basic description, expand it into a rich, detailed prompt "
    "that will produce a stunning, high-quality image."
)

# Load once at startup
print(" Loading model...")
tokenizer = AutoTokenizer.from_pretrained(ADAPTER_PATH)
tokenizer.pad_token = tokenizer.eos_token

base  = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.float32)
model = PeftModel.from_pretrained(base, ADAPTER_PATH)
model.eval()
print(" Model ready!")

def optimize_prompt(simple_prompt: str) -> str:
    input_text = (
        f"### Instruction:\n{INSTRUCTION}\n\n"
        f"### Input:\n{simple_prompt}\n\n"
        f"### Response:\n"
    )

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=200,
    )

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=80,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.3,      # fixes the skyscraper repeat bug!
            pad_token_id=tokenizer.eos_token_id,
        )

    generated = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[1]:],
        skip_special_tokens=True,
    ).strip()

    return generated