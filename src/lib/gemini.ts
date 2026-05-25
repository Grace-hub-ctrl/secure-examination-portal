import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestions(topic: string, count: number = 5) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} diverse questions about ${topic}. 
    Include a mix of:
    - Multiple choice (type: "multiple-choice", question, options: 4 strings, correctIndex: 0-3)
    - True/False (type: "true-false", question, options: ["True", "False"], correctIndex: 0-1)
    - Short answer (type: "short-answer", question, correctAnswer: string)
    
    Return as a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text);
}
