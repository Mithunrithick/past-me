// frontend/api/getReflection.js
import { config } from 'dotenv';
config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(request, response) {
  // Get the ORIGINAL entry text from the request
  const { entryText } = request.body;

  if (!entryText) {
    return response.status(400).json({
      error: "Request must include 'entryText' field.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- NEW PROMPT for Reflection ---
    const prompt = `
    Based *only* on the following journal entry, ask the user one single, gentle, open-ended, and insightful question to encourage deeper self-reflection about the feelings or events described. Do not give advice or opinions. Frame the question directly to the user (e.g., "What makes you feel..." or "How did you...").

    JOURNAL ENTRY:
    "${entryText}"

    REFLECTIVE QUESTION:
    `;
    // --- END OF NEW PROMPT ---

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const reflectionQuestion = aiResponse.text().trim();

    // Send just the question string back
    return response.status(200).json({ question: reflectionQuestion });

  } catch (e) {
    console.error("Reflection error:", e);
    return response.status(500).json({
      error: `An error occurred generating reflection: ${e.message}`,
    });
  }
}