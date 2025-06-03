from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from persona_gen import generate_persona  # Uses OpenAI and returns clues + answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update this if your frontend domain changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate_persona")
async def fetch_persona():
    """
    Endpoint to generate a culturally grounded persona.
    - Returns 'clues' (shown to user) and 'answer' (revealed after guess).
    """
    return await generate_persona()
