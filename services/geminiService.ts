import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AnalysisResult } from "../types";

export const analyzeCode = async (code: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: code }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        // Setting a high token limit to allow for long traces
        maxOutputTokens: 8192, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON. Gemini 3 Flash is usually very good at adhering to JSON mode,
    // but we add a safety trim just in case.
    const cleanJson = text.trim();
    const result: AnalysisResult = JSON.parse(cleanJson);
    
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
