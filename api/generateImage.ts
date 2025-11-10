import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      return response.status(200).json({ imageUrl });
    } else {
      throw new Error("No image was generated.");
    }

  } catch (error: any) {
    console.error("Error in /api/generateImage:", error);
    let detailedError = "An error occurred while generating the image.";
    if (error.message) {
        detailedError = error.message;
    }
    return response.status(500).json({ error: detailedError });
  }
}
