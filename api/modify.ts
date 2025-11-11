import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

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
    nutritionalInfo: {
      type: Type.OBJECT,
      description: "Estimated nutritional information per serving for the modified recipe.",
      properties: {
        calories: { type: Type.STRING, description: "Estimated calories, e.g., '450 kcal'." },
        protein: { type: Type.STRING, description: "Estimated protein, e.g., '30g'." },
        carbs: { type: Type.STRING, description: "Estimated carbohydrates, e.g., '25g'." },
        fat: { type: Type.STRING, description: "Estimated fat, e.g., '15g'." }
      },
      required: ["calories", "protein", "carbs", "fat"]
    },
    beveragePairing: {
      type: Type.OBJECT,
      description: "Suggestions for wine, beer, and non-alcoholic beverages that pair well with the dish.",
      properties: {
        wine: { type: Type.STRING, description: "A specific wine pairing suggestion, e.g., 'A crisp Sauvignon Blanc'." },
        beer: { type: Type.STRING, description: "A specific beer pairing suggestion, e.g., 'A light Pilsner'." },
        nonAlcoholic: { type: Type.STRING, description: "A creative non-alcoholic pairing, e.g., 'Sparkling cranberry and lime spritzer'." }
      },
      required: ["wine", "beer", "nonAlcoholic"]
    }
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "ingredients", "instructions", "nutritionalInfo", "beveragePairing"],
};

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
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const { recipe, modification }: { recipe: Recipe; modification: string } = request.body;

  if (!recipe || !modification) {
    return response.status(400).json({ error: "A recipe and a modification instruction are required." });
  }
    
  const prompt = `
    Take the following recipe and modify it based on the user's request.

    Original Recipe Name: "${recipe.recipeName}"
    Modification Request: "${modification}"

    Original Recipe Ingredients:
    - ${recipe.ingredients.join('\n- ')}
    
    Original Recipe Instructions:
    - ${recipe.instructions.join('\n- ')}

    Please generate a new version of this recipe that fits the modification request.
    The new recipe should have a slightly different, creative name to reflect the change. For example, if the original recipe is "Classic Chicken Soup" and the modification is "make it spicy", the new name could be "Spicy Chipotle Chicken Soup".
    Also, provide an estimated nutritional breakdown for the modified version and new beverage pairings (wine, beer, non-alcoholic) that are suitable for this modified version.
    Return the complete new recipe in the specified JSON format.
  `;

  try {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
        }
    });

    const jsonText = result.text.trim();
    const recipeData = JSON.parse(jsonText);
    return response.status(200).json(recipeData);

  } catch (error: any) {
    console.error("Error in /api/modify:", error);
        
    let detailedError = "An error occurred while modifying the recipe.";

    if (error.response && error.response.data && error.response.data.error) {
        detailedError = `Gemini API Error: ${error.response.data.error.message}`;
    } else if (error.message) {
        detailedError = error.message;
    }

    if (error instanceof SyntaxError) {
        return response.status(500).json({ error: "Failed to parse a valid JSON response from the AI model." });
    }
    
    return response.status(500).json({ error: detailedError });
  }
}