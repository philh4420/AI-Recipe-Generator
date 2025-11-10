
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This file runs on the server, so we define the types it needs directly.
interface FormData {
    ingredients: string;
    diet: string;
    cuisine: string;
    cookingMethod: string;
}

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "Creative and appealing name for the recipe."
    },
    description: {
      type: Type.STRING,
      description: "A brief, enticing description of the dish."
    },
    prepTime: {
      type: Type.STRING,
      description: "Estimated preparation time, e.g., '15 mins'."
    },
    cookTime: {
      type: Type.STRING,
      description: "Estimated cooking time, e.g., '30 mins'."
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A specific ingredient with quantity, e.g., '2 cups flour'."
      },
      description: "List of all ingredients required for the recipe."
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A single, clear step in the cooking process."
      },
      description: "Step-by-step instructions to prepare the dish."
    },
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "ingredients", "instructions"],
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // On the server, we use API_KEY without any prefix.
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return response.status(500).json({ error: "The API_KEY environment variable is not set on the server." });
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const formData: FormData = request.body;
  const { ingredients, diet, cuisine, cookingMethod } = formData;
    
  const prompt = `Generate a list of 3 recipes based on the following criteria.
    - Key Ingredients: ${ingredients || 'any'}
    - Dietary Preference: ${diet || 'any'}
    - Cuisine Style: ${cuisine || 'any'}
    - Cooking Method: ${cookingMethod || 'any'}
    
    Please create unique and delicious recipes that fit these requirements. Ensure the output is a valid JSON array of objects, where each object matches the provided schema.`;

  try {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: recipeSchema,
            },
        }
    });

    const jsonText = result.text.trim();
    // Validate by parsing before sending.
    const recipeData = JSON.parse(jsonText);
    return response.status(200).json(recipeData);

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return response.status(401).json({ error: "The server's Gemini API key is not valid." });
    }
    if (error instanceof SyntaxError) {
        return response.status(500).json({ error: "Failed to parse a valid JSON response from the AI model." });
    }
    return response.status(500).json({ error: "An error occurred while generating recipes." });
  }
}
