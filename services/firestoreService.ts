// FIX: Removed modular imports and updated all Firestore calls to use the v8/compat syntax.
import { db } from "../firebase";
import type { Recipe, PantryItem, ShoppingListItem, MealPlan, TasteProfile, Review } from "../types";

const USERS_COLLECTION = "users";
const RECIPES_SUBCOLLECTION = "recipes";
const PANTRY_SUBCOLLECTION = "pantry";
const SHOPPING_LIST_SUBCOLLECTION = "shoppingList";
const MEAL_PLAN_DOC_ID = "---MEAL-PLAN---";
const TASTE_PROFILE_DOC_ID = "---TASTE-PROFILE---";


// --- RECIPES (PRIVATE MODEL) ---

export const addRecipe = async (userId: string, recipe: Omit<Recipe, 'id'>): Promise<string> => {
    try {
        const fullRecipe = {
            ...recipe,
            avgRating: 0,
            ratingCount: 0,
            reviews: [],
        };
        const recipesCollection = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION);
        const docRef = await recipesCollection.add(fullRecipe);
        return docRef.id;
    } catch (e) {
        console.error("Error adding recipe: ", e);
        throw new Error("Could not save recipe.");
    }
};

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
    try {
        const recipesCollection = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION);
        const recipesSnapshot = await recipesCollection.get();
        return recipesSnapshot.docs
            .filter(doc => doc.id !== MEAL_PLAN_DOC_ID && doc.id !== TASTE_PROFILE_DOC_ID)
            .map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (e) {
        console.error("Error getting recipes: ", e);
        throw new Error("Could not fetch recipes.");
    }
}

export const deleteRecipe = async (userId: string, recipeId: string): Promise<void> => {
    try {
        const recipeDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(recipeId);
        await recipeDocRef.delete();
    } catch (e) {
        console.error("Error deleting recipe: ", e);
        throw new Error("Could not delete recipe.");
    }
}

// --- REVIEWS (EMBEDDED MODEL) ---

export const addReview = async (userId: string, recipeId: string, reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> => {
    const recipeRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(recipeId);
    try {
        await db.runTransaction(async (transaction) => {
            const recipeDoc = await transaction.get(recipeRef);
            if (!recipeDoc.exists) {
                throw new Error("Recipe document not found!");
            }

            const recipe = recipeDoc.data() as Recipe;
            const currentReviews = recipe.reviews || [];
            const currentRatingCount = recipe.ratingCount || 0;
            const currentAvgRating = recipe.avgRating || 0;

            const newReview: Review = {
                ...reviewData,
                id: db.collection('dummy').doc().id, // Generate a unique client-side ID for the review
                createdAt: new Date().toISOString(), // Use ISO string for simplicity and JSON compatibility
            };

            const newReviews = [newReview, ...currentReviews];
            const newRatingCount = currentRatingCount + 1;
            const newTotalRating = (currentAvgRating * currentRatingCount) + newReview.rating;
            const newAvgRating = newTotalRating / newRatingCount;
            
            transaction.update(recipeRef, {
                reviews: newReviews,
                ratingCount: newRatingCount,
                avgRating: newAvgRating,
            });
        });
    } catch (e) {
        console.error("Error adding review:", e);
        throw new Error("Could not submit review.");
    }
};


// --- PANTRY ---

export const getPantryItems = async (userId: string): Promise<PantryItem[]> => {
    try {
        const pantryCollection = db.collection(USERS_COLLECTION).doc(userId).collection(PANTRY_SUBCOLLECTION);
        const querySnapshot = await pantryCollection.get();
        return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    } catch (e) {
        console.error("Error getting pantry items: ", e);
        throw new Error("Could not fetch pantry items.");
    }
};

export const addPantryItem = async (userId: string, itemName: string): Promise<PantryItem> => {
    try {
        const pantryCollection = db.collection(USERS_COLLECTION).doc(userId).collection(PANTRY_SUBCOLLECTION);
        const docRef = await pantryCollection.add({ name: itemName });
        return { id: docRef.id, name: itemName };
    } catch (e) {
        console.error("Error adding pantry item: ", e);
        throw new Error("Could not add pantry item.");
    }
};

export const deletePantryItem = async (userId: string, itemId: string): Promise<void> => {
    try {
        const itemDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(PANTRY_SUBCOLLECTION).doc(itemId);
        await itemDocRef.delete();
    } catch (e) {
        console.error("Error deleting pantry item: ", e);
        throw new Error("Could not delete pantry item.");
    }
};


// --- SHOPPING LIST ---

export const getShoppingListItems = async (userId: string): Promise<ShoppingListItem[]> => {
    try {
        const shoppingListCollection = db.collection(USERS_COLLECTION).doc(userId).collection(SHOPPING_LIST_SUBCOLLECTION);
        const querySnapshot = await shoppingListCollection.get();
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
    } catch (e) {
        console.error("Error getting shopping list items: ", e);
        throw new Error("Could not fetch shopping list.");
    }
};

export const addShoppingListItems = async (userId: string, items: Omit<ShoppingListItem, 'id'>[]): Promise<void> => {
    if (items.length === 0) return;
    try {
        const shoppingListCollection = db.collection(USERS_COLLECTION).doc(userId).collection(SHOPPING_LIST_SUBCOLLECTION);
        const batch = db.batch();
        items.forEach(item => {
            const docRef = shoppingListCollection.doc();
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
        const itemDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(SHOPPING_LIST_SUBCOLLECTION).doc(itemId);
        await itemDocRef.update({ isChecked });
    } catch (e) {
        console.error("Error updating shopping list item: ", e);
        throw new Error("Could not update shopping list item.");
    }
};

export const deleteShoppingListItems = async (userId: string, itemIds: string[]): Promise<void> => {
     if (itemIds.length === 0) return;
    try {
        const shoppingListCollection = db.collection(USERS_COLLECTION).doc(userId).collection(SHOPPING_LIST_SUBCOLLECTION);
        const batch = db.batch();
        itemIds.forEach(id => {
            const docRef = shoppingListCollection.doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error deleting shopping list items: ", e);
        throw new Error("Could not delete items from shopping list.");
    }
};

// --- MEAL PLAN & TASTE PROFILE (using the workaround) ---

export const getMealPlan = async (userId: string): Promise<MealPlan> => {
    try {
        const planDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(MEAL_PLAN_DOC_ID);
        const docSnap = await planDocRef.get();
        return docSnap.exists ? docSnap.data() as MealPlan : {};
    } catch (e) {
        console.error("Error getting meal plan: ", e);
        throw new Error("Could not fetch meal plan.");
    }
};

export const updateMealPlan = async (userId: string, mealPlan: MealPlan): Promise<void> => {
    try {
        const planDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(MEAL_PLAN_DOC_ID);
        await planDocRef.set(mealPlan);
    } catch (e) {
        console.error("Error updating meal plan: ", e);
        throw new Error("Could not update meal plan.");
    }
};

export const getTasteProfile = async (userId: string): Promise<TasteProfile> => {
    try {
        const profileDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(TASTE_PROFILE_DOC_ID);
        const docSnap = await profileDocRef.get();
        return docSnap.exists ? docSnap.data() as TasteProfile : {};
    } catch (e) {
        console.error("Error getting taste profile: ", e);
        throw new Error("Could not fetch taste profile.");
    }
};

export const updateTasteProfile = async (userId: string, tasteProfile: TasteProfile): Promise<void> => {
    try {
        const profileDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(RECIPES_SUBCOLLECTION).doc(TASTE_PROFILE_DOC_ID);
        await profileDocRef.set(tasteProfile);
    } catch (e) {
        console.error("Error updating taste profile: ", e);
        throw new Error("Could not update taste profile.");
    }
};