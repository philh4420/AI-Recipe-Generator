import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKFtea9Bdd-rNiKJZCrbtbob5kMKSEqeg",
  authDomain: "ai-recipe-generator-2b329.firebaseapp.com",
  projectId: "ai-recipe-generator-2b329",
  storageBucket: "ai-recipe-generator-2b329.firebasestorage.app",
  messagingSenderId: "369899380214",
  appId: "1:369899380214:web:6252f49912f4d4d90f7bd7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore immediately and export the instance.
// This ensures db is ready whenever it's imported elsewhere.
export const db = getFirestore(app);
