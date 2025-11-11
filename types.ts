import type { User } from 'firebase/auth';

export interface Recipe {
  id?: string;
  publicId?: string; // A stable ID for querying public reviews
  ownerId?: string; // The UID of the user who first saved this recipe
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  avgRating?: number;
  ratingCount?: number;
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
    mealType: string;
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

export interface PantryItem {
  id: string;
  name: string;
}

export interface ShoppingListItem {
  id:string;
  name: string;
  recipeName: string;
  isChecked: boolean;
}

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export interface PlannedRecipe {
    id: string;
    recipeName: string;
}

export type MealPlan = {
    [key in DayOfWeek]?: PlannedRecipe | null;
};

export interface TasteProfile {
    favoriteIngredients?: string;
    favoriteCuisines?: string;
    dietaryPreference?: string;
    excludedIngredients?: string;
}

// New type for Reviews
export interface Review {
    id?: string;
    recipeId: string;
    userId: string;
    userName: string;
    userPhotoUrl: string | null;
    rating: number;
    comment: string;
    imageUrl?: string;
    createdAt: any; // Using 'any' for Firestore Timestamp compatibility
}


export type View = 'generator' | 'saved' | 'pantry' | 'shoppingList' | 'mealPlanner' | 'profile';