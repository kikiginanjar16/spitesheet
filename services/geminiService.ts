
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSpriteImage = async (prompt: string, rows: number, cols: number, aspectRatio: "1:1" | "4:3" | "16:9" = "1:1") => {
  const ai = getAI();
  
  const enhancedPrompt = `
    Create a professional game asset sprite sheet for: ${prompt}. 
    REQUIREMENT: The sprite sheet MUST be organized into a strict grid of ${rows} rows and ${cols} columns.
    Total frames: ${rows * cols}.
    Background: Solid white. 
    Style: Professional 2D game asset, pixel art or clean vector. 
    Ensure each frame is centered within its grid cell.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received from Gemini");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const refineSpritePrompt = async (userInput: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this simple sprite idea into a highly detailed visual prompt for an image generator: "${userInput}". Focus on character traits, color palette, and clear distinct animation frames. DO NOT mention specific grid numbers, as those will be appended separately. Keep it focused on the visual style.`
  });
  return response.text || userInput;
};
