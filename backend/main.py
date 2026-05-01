import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, Request
from PIL import Image

# 🔑 Gemini API Key - Fixed syntax (added quotes)
genai.configure(api_key="AIzaSyBdE-MS9M2yLbj3v5kcn0hvwNsSYGBs5Ss")

# 🤖 Model - Fixed model name to valid gemini-1.5-flash
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

@app.get("/")
def home():
    return {"status": "Glow AI Backend Running"}

# 🔹 Face Scan (basic simulation + structure ready)
@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    image = Image.open(file.file)

    # 👉 Abhi dummy (replace later with ML model)
    result = {
        "acne": "Moderate",
        "oil": "High",
        "pigmentation": "Low"
    }

    return result

# 🔹 Gemini Chat (REAL direct)
@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    msg = data["message"]

    response = model.generate_content(msg)

    return {"reply": response.text}
