import { config } from 'dotenv';
config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// --- NEW: Our list of standard emotions ---
const emotionList = [
  'Happy', 'Joyful', 'Grateful', 'Confident', 'Productive', // Positive
  'Sad', 'Anxious', 'Stressed', 'Angry', 'Tired',     // Negative
  'Calm', 'Reflective', 'Neutral'                     // Neutral
].join(', ');

export default async function handler(request, response) {
  const { text } = request.body;

  if (!text) {
    return response.status(400).json({
      error: "Request must include 'text' field.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // --- PROMPT UPDATED ---
    const prompt = `
      Analyze the following journal entry. You must provide a JSON object with five keys:

      1. 'emotion': You MUST choose ONE single, primary emotion from this exact list: [${emotionList}].
      2. 'summary': A one-sentence summary of the key event or feeling.
      3. 'reply': A short, empathetic, 1-sentence reply to the user.
      4. 'keywords': An array of 3-5 key nouns or topics.
      5. 'sentiment_score': A number between -1.0 (very negative) and 1.0 (very positive), representing the overall sentiment.

      ENTRY: "${text}"

      JSON:
      `;
    // --- END OF UPDATE ---

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    
    const aiJsonString = aiResponse.text()
      .trim()
      .replace(/^```json\n/, "")
      .replace(/\n```$/, "");

    return response.status(200).json({ reply: aiJsonString });

  } catch (e) {
    console.error("An error occurred:", e);
    return response.status(500).json({
      error: `An error occurred: ${e.message}`,
    });
  }
}