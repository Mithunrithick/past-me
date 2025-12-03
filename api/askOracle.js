import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(request, response) {
  const { question, context } = request.body;

  if (!question || !context) {
    return response.status(400).json({ error: "Missing question or context." });
  }

  try {
    // --- FIX: Changed model to match your working processEntry.js ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are "The Oracle," a wise, mystical, and highly intelligent AI analyst for a personal journal.
    
    Here is the user's recorded memory log (Journal Entries):
    ---------------------------------------------------------
    ${context}
    ---------------------------------------------------------

    USER QUESTION: "${question}"

    INSTRUCTIONS:
    1. Answer the user's question based ONLY on the provided journal entries.
    2. Be insightful. Connect dots between different entries.
    3. Cite specific dates or events to prove you know their history.
    4. If the answer isn't in the journals, say "The stars do not hold this answer."
    5. Keep the tone mystical but helpful.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const answer = aiResponse.text().trim();

    return response.status(200).json({ answer });

  } catch (e) {
    console.error("Oracle Error:", e);
    return response.status(500).json({ error: e.message });
  }
}