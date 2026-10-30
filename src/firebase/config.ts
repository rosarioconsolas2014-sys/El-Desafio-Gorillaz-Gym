import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCSxJAMx7g6dPzAg22GnfJArOiQu32jOxI",
  authDomain: "gorillaz-gym-the--challenge.firebaseapp.com",
  projectId: "gorillaz-gym-the--challenge",
  storageBucket: "gorillaz-gym-the--challenge.firebasestorage.app",
  messagingSenderId: "249951969959",
  appId: "1:249951969959:web:0b5ef92599fade9810b182"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
