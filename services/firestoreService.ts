import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Recipe } from "../types";

const RECIPES_COLLECTION = "recipes";

// Add a new document with a generated id.
export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipe);
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not save recipe.");
    }
};

// Get all documents from the collection
export const getRecipes = async (): Promise<Recipe[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
        const recipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
            recipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        return recipes;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Could not fetch recipes.");
    }
}

// Delete a document from the collection
export const deleteRecipe = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, RECIPES_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete recipe.");
    }
}
