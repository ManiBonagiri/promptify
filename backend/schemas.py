# schemas.py
from pydantic import BaseModel

class PromptRequest(BaseModel):
    prompt: str

class PromptResponse(BaseModel):
    original: str
    optimized: str

class ImageRequest(BaseModel):
    prompt: str

class ImageResponse(BaseModel):
    image_url: str
    prompt_used: str