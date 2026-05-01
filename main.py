import google.generativeai as genai
from fastapi import FastAPI, Request

# 🔑 Gemini API Key - Added quotes to make it a valid string
genai.configure(api_key="AIzaSyBdE-MS9M2yLbj3v5kcn0hvwNsSYGBs5Ss")

# 🤖 Model
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

@app.get("/")
def home():
    return {"status": "Gemini Chat Running"}

@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    user_message = data.get("message", "")

    try:
        # ✅ Direct Gemini response with token limit
        response = model.generate_content(
            user_message,
            generation_config={
                "max_output_tokens": 300
            }
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }
