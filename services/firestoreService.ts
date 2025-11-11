import { collection, addDoc, getDocs, doc, deleteDoc, writeBatch, query, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Recipe, PantryItem, ShoppingListItem, MealPlan, TasteProfile } from "../types";

const USERS_COLLECTION = "users";
const RECIPES_SUBCOLLECTION = "recipes";
const PANTRY_SUBCOLLECTION = "pantry";
const SHOPPING_LIST_SUBCOLLECTION = "shoppingList";
const MEAL_PLAN_DOC_ID = "---MEAL-PLAN---"; // Special ID to store the meal plan within the recipes collection to reuse permissions

// --- RECIPES ---

export const addRecipe = async (userId: string, recipe: Omit<Recipe, 'id'>): Promise<string> => {
    try {
        const userRecipesCollection = collection(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION);
        const docRef = await addDoc(userRecipesCollection, recipe);
        return docRef.id;
    } catch (e) {
        console.error("Error adding recipe: ", e);
        throw new Error("Could not save recipe.");
    }
};

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
    try {
        const userRecipesCollection = collection(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION);
        const querySnapshot = await getDocs(userRecipesCollection);
        return querySnapshot.docs
            .filter(doc => doc.id !== MEAL_PLAN_DOC_ID) // Exclude the special meal plan document
            .map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (e) {
        console.error("Error getting recipes: ", e);
        throw new Error("Could not fetch recipes.");
    }
}

export const deleteRecipe = async (userId: string, recipeId: string): Promise<void> => {
    try {
        const recipeDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, recipeId);
        await deleteDoc(recipeDocRef);
    } catch (e) {
        console.error("Error deleting recipe: ", e);
        throw new Error("Could not delete recipe.");
    }
}


// --- PANTRY ---

export const getPantryItems = async (userId: string): Promise<PantryItem[]> => {
    try {
        const pantryCollection = collection(db, USERS_COLLECTION, userId, PANTRY_SUBCOLLECTION);
        const querySnapshot = await getDocs(pantryCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    } catch (e) {
        console.error("Error getting pantry items: ", e);
        throw new Error("Could not fetch pantry items.");
    }
};

export const addPantryItem = async (userId: string, itemName: string): Promise<PantryItem> => {
    try {
        const pantryCollection = collection(db, USERS_COLLECTION, userId, PANTRY_SUBCOLLECTION);
        const docRef = await addDoc(pantryCollection, { name: itemName });
        return { id: docRef.id, name: itemName };
    } catch (e) {
        console.error("Error adding pantry item: ", e);
        throw new Error("Could not add pantry item.");
    }
};

export const deletePantryItem = async (userId: string, itemId: string): Promise<void> => {
    try {
        const itemDocRef = doc(db, USERS_COLLECTION, userId, PANTRY_SUBCOLLECTION, itemId);
        await deleteDoc(itemDocRef);
    } catch (e) {
        console.error("Error deleting pantry item: ", e);
        throw new Error("Could not delete pantry item.");
    }
};


// --- SHOPPING LIST ---

export const getShoppingListItems = async (userId: string): Promise<ShoppingListItem[]> => {
    try {
        const shoppingListCollection = collection(db, USERS_COLLECTION, userId, SHOPPING_LIST_SUBCOLLECTION);
        const querySnapshot = await getDocs(shoppingListCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
    } catch (e) {
        console.error("Error getting shopping list items: ", e);
        throw new Error("Could not fetch shopping list.");
    }
};

export const addShoppingListItems = async (userId: string, items: Omit<ShoppingListItem, 'id'>[]): Promise<void> => {
    if (items.length === 0) return;
    try {
        const shoppingListCollection = collection(db, USERS_COLLECTION, userId, SHOPPING_LIST_SUBCOLLECTION);
        const batch = writeBatch(db);
        items.forEach(item => {
            const docRef = doc(shoppingListCollection); // Create a new doc with a random ID
            batch.set(docRef, item);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error adding shopping list items: ", e);
        throw new Error("Could not add items to shopping list.");
    }
};

export const updateShoppingListItem = async (userId: string, itemId: string, isChecked: boolean): Promise<void> => {
    try {
        const itemDocRef = doc(db, USERS_COLLECTION, userId, SHOPPING_LIST_SUBCOLLECTION, itemId);
        await updateDoc(itemDocRef, { isChecked });
    } catch (e) {
        console.error("Error updating shopping list item: ", e);
        throw new Error("Could not update shopping list item.");
    }
};

export const deleteShoppingListItems = async (userId: string, itemIds: string[]): Promise<void> => {
     if (itemIds.length === 0) return;
    try {
        const shoppingListCollection = collection(db, USERS_COLLECTION, userId, SHOPPING_LIST_SUBCOLLECTION);
        const batch = writeBatch(db);
        itemIds.forEach(id => {
            const docRef = doc(shoppingListCollection, id);
            batch.delete(docRef);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error deleting shopping list items: ", e);
        throw new Error("Could not delete items from shopping list.");
    }
};

// --- MEAL PLAN ---

export const getMealPlan = async (userId: string): Promise<MealPlan> => {
    try {
        const planDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, MEAL_PLAN_DOC_ID);
        const docSnap = await getDoc(planDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as MealPlan;
        }
        return {}; // Return empty object if no plan exists yet
    } catch (e) {
        console.error("Error getting meal plan: ", e);
        throw new Error("Could not fetch meal plan.");
    }
};

export const updateMealPlan = async (userId: string, mealPlan: MealPlan): Promise<void> => {
    try {
        const planDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, MEAL_PLAN_DOC_ID);
        await setDoc(planDocRef, mealPlan);
    } catch (e) {
        console.error("Error updating meal plan: ", e);
        throw new Error("Could not update meal plan.");
    }
};

// --- TASTE PROFILE ---

export const getTasteProfile = async (userId: string): Promise<TasteProfile> => {
    try {
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().tasteProfile) {
            return docSnap.data().tasteProfile as TasteProfile;
        }
        return {}; // Return empty object if no profile exists
    } catch (e) {
        console.error("Error getting taste profile: ", e);
        throw new Error("Could not fetch taste profile.");
    }
};

export const updateTasteProfile = async (userId: string, tasteProfile: TasteProfile): Promise<void> => {
    try {
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        // Use set with merge to create or update the profile field without overwriting other user data
        await setDoc(userDocRef, { tasteProfile }, { merge: true });
    } catch (e) {
        console.error("Error updating taste profile: ", e);
        throw new Error("Could not update taste profile.");
    }
};