import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(request, response) {
  const { context } = request.body;

  if (!context) {
    return response.status(400).json({ error: "Missing context data." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a psychological analyst AI. Based on the user's journal history below, create a "Cosmic Identity Profile".
    
    JOURNAL HISTORY:
    ${context}

    INSTRUCTIONS:
    Return ONLY a raw JSON object. Do not use Markdown formatting. Do not write "Here is the JSON". Just the JSON.
    
    JSON Structure:
    {
      "archetype": "Title (e.g. 'The Resilient Stoic')",
      "traits": ["Trait 1", "Trait 2", "Trait 3"],
      "element": "Fire, Water, Earth, or Air",
      "summary": "A 2-sentence psychological observation.",
      "mantra": "A short, powerful phrase."
    }
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    let text = aiResponse.text();

    // --- JSON CLEANING (The Fix) ---
    // 1. Remove markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Find the first '{' and the last '}'
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1) {
      text = text.substring(firstOpen, lastClose + 1);
    }
    // -------------------------------
    
    return response.status(200).json(JSON.parse(text));

  } catch (e) {
    console.error("Identity Error:", e);
    // Send the actual error message back
    return response.status(500).json({ error: e.message });
  }
}