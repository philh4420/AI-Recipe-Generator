import type { User } from 'firebase/auth';

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

export type FirebaseUser = User;

export interface AuthCredentials {
    displayName?: string;
    email: string;
    password?: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}