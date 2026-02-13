import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG } from "./env.js";

export const firebaseApp = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(firebaseApp);
