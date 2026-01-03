
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMorningQuote = async (): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Generate a short, beautiful, and deeply inspiring morning quote to wake someone up with positivity and good luck.
      It should be poetic but easy to understand.
      Do not include the author's name.
      Do not use quotes ("") in the output.
      Max 30 words.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response from AI");
    
    return text;
  } catch (error) {
    // Throw error so the UI can handle the error state/retry logic silently or with fallbacks
    throw error;
  }
};
