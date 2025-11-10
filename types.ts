export interface Recipe {
  id?: string;
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
}

export interface InputFormProps {
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
}

export interface FormData {
    ingredients: string;
    diet: string;
    cuisine: string;
    cookingMethod: string;
}