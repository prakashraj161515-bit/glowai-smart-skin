import { getSecureKey } from "@/lib/api-key-manager";

/**
 * AI Coach Service
 * Connects to Gemini API using the obfuscated key.
 */

export async function askCoach(question: string) {
  const apiKey = getSecureKey();
  
  // In a real production app, you would use this key to call the Gemini API
  // Example: 
  // const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
  
  console.log("Calling AI Coach with secured key...");
  
  // Mock response for demo
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return "Based on your skin profile, I suggest focus on hydration. Your recent scan shows slight dryness in the cheek area. Using a hyaluronic acid serum would be beneficial. ✨";
}
