import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadReviewImage = async (file: File, userId: string, recipeId: string): Promise<string> => {
    if (!file) throw new Error("No file provided for upload.");

    const timestamp = new Date().getTime();
    const storageRef = ref(storage, `review-images/${recipeId}/${userId}-${timestamp}-${file.name}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        throw new Error("Could not upload image.");
    }
};
