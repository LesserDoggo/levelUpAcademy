import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyActCf4hKzTLaB4GMYskZc2wKZdZm_SEUA",
  authDomain: "levelup-8f123.firebaseapp.com",
  projectId: "levelup-8f123",
  storageBucket: "levelup-8f123.firebasestorage.app",
  messagingSenderId: "1057924564707",
  appId: "1:1057924564707:web:10acc01126e8f3b8d767d6",
};

const GAME_FIREBASE_APP_NAME = "levelup-game";

export const firebaseApp =
  getApps().find((app) => app.name === GAME_FIREBASE_APP_NAME) ??
  initializeApp(firebaseConfig, GAME_FIREBASE_APP_NAME);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
