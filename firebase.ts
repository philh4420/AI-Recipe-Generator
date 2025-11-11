// FIX: Switched to compat imports for all services to ensure consistency.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKFtea9Bdd-rNiKJZCrbtbob5kMKSEqeg",
  authDomain: "ai-recipe-generator-2b329.firebaseapp.com",
  projectId: "ai-recipe-generator-2b329",
  storageBucket: "ai-recipe-generator-2b329.firebasestorage.app",
  messagingSenderId: "369899380214",
  appId: "1:369899380214:web:6252f49912f4d4d90f7bd7"
};

// Initialize Firebase using the compat library
const app = firebase.initializeApp(firebaseConfig);

// Initialize all services using the compat syntax
export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();