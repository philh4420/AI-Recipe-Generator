
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return response.status(500).json({ error: "The API_KEY environment variable is not set on the server." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const { prompt } = request.body;

    if (!prompt) {
      return response.status(400).json({ error: "Prompt is required." });
    }

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    // Loop through parts to find the image data
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        return response.status(200).json({ imageUrl });
      }
    }
    
    // If loop completes without finding an image
    throw new Error("No image data was found in the AI response.");

  } catch (error: any) {
    console.error("Error in /api/generateImage:", error);
    let detailedError = "An error occurred while generating the image.";

    if (error.response && error.response.data && error.response.data.error) {
        detailedError = `Gemini API Error: ${error.response.data.error.message}`;
    } else if (error.message) {
        detailedError = error.message;
    }
    
    return response.status(500).json({ error: detailedError });
  }
}
