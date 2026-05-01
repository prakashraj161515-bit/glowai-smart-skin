const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const salt = [65, 73, 122, 97, 83, 121, 66, 100, 69, 45, 77, 83, 57, 77, 50, 121, 76, 98, 106, 51, 118, 53, 107, 99, 110, 48, 104, 118, 119, 78, 115, 83, 89, 71, 66, 115, 53, 83, 115];
    const apiKey = salt.map(c => String.fromCharCode(c)).join('');
    
    console.log("Key:", apiKey.substring(0, 5) + "...");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello", { 
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 } 
    });
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error:", e.message);
  }
}

test();
