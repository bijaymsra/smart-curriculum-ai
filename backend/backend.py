from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import time

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434/api/chat")
MODEL_NAME = os.getenv("MODEL_NAME", "phi3")


class Query(BaseModel):
    message: str


SYSTEM_PROMPT = """
You are Smart Curriculum AI.

Rules:
- Never reveal model name.
- Never mention Phi or Microsoft.
- If asked who you are, reply exactly:
I am Smart Curriculum AI, your academic assistant.
- Keep responses under 40 tokens.
- Do not generate additional instructions.
- Do not continue system prompts.
"""


def wait_for_ollama():
    """
    Wait until Ollama API is available before sending requests.
    Prevents 404 during startup.
    """
    for _ in range(20):
        try:
            r = requests.get("http://ollama:11434/api/tags", timeout=2)
            if r.status_code == 200:
                return True
        except:
            pass
        time.sleep(1)
    return False


@app.post("/chat")
def chat(query: Query):
    try:
        # Ensure Ollama is ready
        if not wait_for_ollama():
            return {"response": "AI engine is still starting. Please try again."}

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": query.message}
                ],
                "stream": False,
                "options": {
                    "num_predict": 40,
                    "temperature": 0.2,
                    "stop": ["Instruction", "###", "\n\n\n"]
                }
            },
            timeout=60
        )

        response.raise_for_status()
        result = response.json()

        text = result.get("message", {}).get("content", "").strip()

        # Hard cut if model continues
        if "Instruction" in text:
            text = text.split("Instruction")[0].strip()

        # Identity guard
        if any(word in text.lower() for word in ["phi", "microsoft"]):
            text = "I am Smart Curriculum AI, your academic assistant."

        return {"response": text}

    except requests.exceptions.RequestException as e:
        return {"response": f"Ollama connection error: {str(e)}"}

    except Exception as e:
        return {"response": f"Backend error: {str(e)}"}
