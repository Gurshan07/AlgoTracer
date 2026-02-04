import { SYSTEM_PROMPT } from "../constants";
import { AnalysisResult } from "../types";

// Declare global puter object
declare const puter: any;

export const analyzeCode = async (code: string): Promise<AnalysisResult> => {
  try {
    // Puter AI Chat Interface
    // We construct a prompt that includes the system instructions and the user code.
    const response = await puter.ai.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: code }
      ],
      {
        model: 'gpt-4o-mini', // Changed to gpt-4o-mini for better availability
      }
    );

    // Puter response structure usually looks like { message: { content: "..." } }
    const text = response?.message?.content;
    
    if (!text) {
      console.error("Puter response:", response);
      throw new Error("No response content from Puter AI");
    }

    // Attempt to extract JSON from the response
    // Sometimes models wrap JSON in ```json ... ``` code blocks
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```/, '').replace(/```$/, '');
    }
    
    const result: AnalysisResult = JSON.parse(jsonString);
    return result;

  } catch (error: any) {
    console.error("Puter AI Error:", error);
    
    let errorMessage = "Failed to analyze code.";
    if (error?.error) {
        errorMessage = error.error; // Handle Puter specific error object
    } else if (error?.message) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    throw new Error(errorMessage);
  }
};