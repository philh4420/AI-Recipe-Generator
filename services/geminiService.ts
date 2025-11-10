import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, FormData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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


export const generateRecipes = async (formData: FormData): Promise<Recipe[]> => {
    const { ingredients, diet, cuisine, cookingMethod } = formData;
    
    const prompt = `Generate a diverse list of at least 10 recipes based on the following criteria.
    - Key Ingredients: ${ingredients || 'any'}
    - Dietary Preference: ${diet || 'any'}
    - Cuisine Style: ${cuisine || 'any'}
    - Cooking Method: ${cookingMethod || 'any'}
    
    Please create unique and delicious recipes that fit these requirements. Ensure the output is a valid JSON array of objects, where each object matches the provided schema.`;

    try {
        const response = await ai.models.generateContent({
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

        const jsonText = response.text.trim();
        const recipeData = JSON.parse(jsonText);
        
        return recipeData as Recipe[];

    } catch (error) {
        console.error("Error generating recipes:", error);
        throw new Error("Failed to generate recipes. The model may be unable to create recipes with the specified combination.");
    }
};