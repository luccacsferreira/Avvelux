import { GoogleGenAI, Type } from "@google/genai";

export const Core = {
  InvokeLLM: async ({ prompt, systemInstruction, response_json_schema }) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const config = {
        systemInstruction: systemInstruction,
      };

      if (response_json_schema) {
        config.responseMimeType = "application/json";
        // Convert simple JSON schema to Gemini responseSchema if needed, 
        // but for now we'll just pass it if it's already in the right format or handle simple cases.
        // The user's schema looks like standard JSON schema.
        config.responseSchema = response_json_schema;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: config,
      });

      const text = response.text;
      if (response_json_schema) {
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON response:', text);
          return text;
        }
      }
      return text;
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw error;
    }
  }
};
