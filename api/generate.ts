import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This file runs on the server, so we define the types it needs directly.
interface ApiPayload {
    ingredients: string;
    diet: string;
    cuisine: string;
    cookingMethod: string;
    mealType: string;
    favoriteIngredients?: string;
    favoriteCuisines?: string;
    excludedIngredients?: string;
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
    nutritionalInfo: {
      type: Type.OBJECT,
      description: "Estimated nutritional information per serving.",
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
  const payload: ApiPayload = request.body;
  const { 
      ingredients, diet, cuisine, cookingMethod, mealType,
      favoriteIngredients, favoriteCuisines, excludedIngredients 
  } = payload;
    
  // Dynamically build the prompt based on provided data
  let prompt = `Generate 3 recipes based on the following user-provided criteria. For each recipe, also provide an estimated nutritional breakdown (calories, protein, carbs, fat) and a "beveragePairing" object containing suggestions for a wine, a beer, and a non-alcoholic drink that would complement the dish.`;
  
  if (ingredients) prompt += `\n- Main Ingredients: ${ingredients}`;
  if (mealType) prompt += `\n- Meal Type: ${mealType}`;
  if (diet) prompt += `\n- Diet: ${diet}`;
  if (cuisine) prompt += `\n- Cuisine: ${cuisine}`;
  if (cookingMethod) prompt += `\n- Cooking Style: ${cookingMethod}`;
  
  // Add taste profile data to the prompt
  if (favoriteIngredients) prompt += `\n- The user's favorite ingredients to inspire the recipe: ${favoriteIngredients}.`;
  if (favoriteCuisines) prompt += `\n- The user's favorite cuisines to draw inspiration from: ${favoriteCuisines}.`;
  if (excludedIngredients) prompt += `\n- IMPORTANT RULE: Absolutely DO NOT include these ingredients or any variations of them: ${excludedIngredients}. This is a critical exclusion.`;

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
    const recipeData = JSON.parse(jsonText);
    return response.status(200).json(recipeData);

  } catch (error: any) {
    console.error("Error in /api/generate:", error);
        
    let detailedError = "An error occurred while generating recipes.";

    if (error.response && error.response.data && error.response.data.error) {
        detailedError = `Gemini API Error: ${error.response.data.error.message}`;
    } else if (error.message) {
        detailedError = error.message;
    }

    if (error instanceof SyntaxError) {
        return response.status(500).json({ error: "Failed to parse a valid JSON response from the AI model. The model may have returned an unexpected format." });
    }
    
    return response.status(500).json({ error: detailedError });
  }
}