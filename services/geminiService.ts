
import type { Recipe, FormData } from "../types";

export const generateRecipes = async (formData: FormData): Promise<Recipe[]> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
        // Use the error message from the serverless function, or a default
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as Recipe[];
};
