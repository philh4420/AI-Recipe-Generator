// FIX: Update all functions to use the v8/compat syntax for Storage.
import { storage } from "../firebase";

export const uploadReviewImage = async (file: File, userId: string, recipeId: string): Promise<string> => {
    if (!file) throw new Error("No file provided for upload.");

    const timestamp = new Date().getTime();
    const storageRef = storage.ref(`review-images/${recipeId}/${userId}-${timestamp}-${file.name}`);

    try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        throw new Error("Could not upload image.");
    }
};