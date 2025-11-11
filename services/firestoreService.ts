import { collection, addDoc, getDocs, doc, deleteDoc, writeBatch, updateDoc, getDoc, setDoc, query, where, serverTimestamp, runTransaction, getDocsFromServer, collectionGroup, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import type { Recipe, PantryItem, ShoppingListItem, MealPlan, TasteProfile, Review } from "../types";
import { getAuth } from 'firebase/auth';

const USERS_COLLECTION = "users";
const RECIPES_SUBCOLLECTION = "recipes"; // Now used for user's saved recipe references
const PANTRY_SUBCOLLECTION = "pantry";
const SHOPPING_LIST_SUBCOLLECTION = "shoppingList";
const MEAL_PLAN_DOC_ID = "---MEAL-PLAN---";
const TASTE_PROFILE_DOC_ID = "---TASTE-PROFILE---";

// New top-level collections for the social features
const PUBLIC_RECIPES_COLLECTION = "public_recipes";
const REVIEWS_COLLECTION = "reviews";

// Helper to generate a stable ID from a recipe name to check for existence
const generatePublicId = (recipeName: string) => {
    return recipeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};


// --- RECIPES (REFACTORED) ---

export const addRecipe = async (userId: string, recipe: Omit<Recipe, 'id'>): Promise<string> => {
    try {
        const publicRecipesCollection = collection(db, PUBLIC_RECIPES_COLLECTION);
        const userRecipesCollection = collection(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION);

        // Check if a recipe with the same name already exists publicly
        const publicId = generatePublicId(recipe.recipeName);
        const q = query(publicRecipesCollection, where("publicId", "==", publicId));
        const existingRecipeSnap = await getDocs(q);

        let recipeId: string;
        if (existingRecipeSnap.empty) {
            // Recipe doesn't exist, add it to the public collection
            const newPublicRecipe = { 
                ...recipe, 
                publicId,
                ownerId: userId, 
                avgRating: 0, 
                ratingCount: 0 
            };
            const publicDocRef = await addDoc(publicRecipesCollection, newPublicRecipe);
            recipeId = publicDocRef.id;
        } else {
            // Recipe already exists, use its ID
            recipeId = existingRecipeSnap.docs[0].id;
        }

        // Add a reference to the user's private saved list
        const userRecipeRef = doc(userRecipesCollection, recipeId);
        await setDoc(userRecipeRef, { recipeName: recipe.recipeName, addedAt: serverTimestamp() }); // Store a simple reference

        return recipeId;
    } catch (e) {
        console.error("Error adding recipe: ", e);
        throw new Error("Could not save recipe.");
    }
};

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
    try {
        const userRecipesCollection = collection(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION);
        const userRecipesSnap = await getDocs(userRecipesCollection);
        
        const recipeIds = userRecipesSnap.docs
            .map(doc => doc.id)
            .filter(id => id !== MEAL_PLAN_DOC_ID && id !== TASTE_PROFILE_DOC_ID);

        if (recipeIds.length === 0) return [];
        
        // Fetch the full recipe data from the public collection
        const publicRecipesCollection = collection(db, PUBLIC_RECIPES_COLLECTION);
        const q = query(publicRecipesCollection, where("__name__", "in", recipeIds));
        const publicRecipesSnap = await getDocs(q);

        return publicRecipesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));

    } catch (e) {
        console.error("Error getting recipes: ", e);
        throw new Error("Could not fetch recipes.");
    }
}

export const deleteRecipe = async (userId: string, recipeId: string): Promise<void> => {
    try {
        // Only delete the user's reference, not the public recipe
        const recipeDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, recipeId);
        await deleteDoc(recipeDocRef);
    } catch (e) {
        console.error("Error deleting recipe: ", e);
        throw new Error("Could not delete recipe.");
    }
}

// --- REVIEWS ---

export const getReviews = async (recipeId: string): Promise<Review[]> => {
    try {
        const q = query(collection(db, REVIEWS_COLLECTION), where("recipeId", "==", recipeId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (e) {
        console.error("Error getting reviews:", e);
        throw new Error("Could not fetch reviews.");
    }
};

export const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> => {
    try {
        // 1. Add the new review
        const reviewsCollection = collection(db, REVIEWS_COLLECTION);
        const newReviewData = { ...reviewData, createdAt: serverTimestamp() };
        await addDoc(reviewsCollection, newReviewData);

        // 2. Use a transaction to update the recipe's average rating
        const recipeRef = doc(db, PUBLIC_RECIPES_COLLECTION, reviewData.recipeId);
        await runTransaction(db, async (transaction) => {
            const recipeDoc = await transaction.get(recipeRef);
            if (!recipeDoc.exists()) {
                throw new Error("Recipe does not exist!");
            }
            const recipeData = recipeDoc.data();
            const oldRatingCount = recipeData.ratingCount || 0;
            const oldAvgRating = recipeData.avgRating || 0;

            const newRatingCount = oldRatingCount + 1;
            const newAvgRating = (oldAvgRating * oldRatingCount + reviewData.rating) / newRatingCount;

            transaction.update(recipeRef, {
                ratingCount: newRatingCount,
                avgRating: newAvgRating
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
            const docRef = doc(shoppingListCollection);
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

// --- MEAL PLAN & TASTE PROFILE (using the workaround) ---

export const getMealPlan = async (userId: string): Promise<MealPlan> => {
    try {
        const planDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, MEAL_PLAN_DOC_ID);
        const docSnap = await getDoc(planDocRef);
        return docSnap.exists() ? docSnap.data() as MealPlan : {};
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

export const getTasteProfile = async (userId: string): Promise<TasteProfile> => {
    try {
        const profileDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, TASTE_PROFILE_DOC_ID);
        const docSnap = await getDoc(profileDocRef);
        return docSnap.exists() ? docSnap.data() as TasteProfile : {};
    } catch (e) {
        console.error("Error getting taste profile: ", e);
        throw new Error("Could not fetch taste profile.");
    }
};

export const updateTasteProfile = async (userId: string, tasteProfile: TasteProfile): Promise<void> => {
    try {
        const profileDocRef = doc(db, USERS_COLLECTION, userId, RECIPES_SUBCOLLECTION, TASTE_PROFILE_DOC_ID);
        await setDoc(profileDocRef, tasteProfile);
    } catch (e) {
        console.error("Error updating taste profile: ", e);
        throw new Error("Could not update taste profile.");
    }
};