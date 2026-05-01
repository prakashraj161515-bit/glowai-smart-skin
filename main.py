import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os

# 🔑 Gemini API Key
API_KEY = "AIzaSyBdE-MS9M2yLbj3v5kcn0hvwNsSYGBs5Ss"
genai.configure(api_key=API_KEY)

# 🤖 Model
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

# ✅ Added CORS Middleware to allow Flutter/Next.js to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "GlowAI Expert Backend Running"}

@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    user_message = data.get("message", "")

    if not user_message:
        return {"error": "Message is required"}

    try:
        # ✅ Professional Skincare Expert Persona
        prompt = f"""
        You are GlowAI, a world-class dermatological assistant.
        User Question: "{user_message}"
        
        Provide professional, empathetic, and scientifically-backed skincare advice in simple language.
        If the user is asking about acne, oil, or dark spots, suggest specific ingredients or routines.
        """
        
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 500, "temperature": 0.7}
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        print(f"🔥 Gemini Error: {e}")
        return {
            "error": "I'm having trouble connecting to my knowledge base right now. Please try again."
        }
