import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const GAME_FIREBASE_APP_NAME = "levelup-game";

function getFirebaseConfig() {
  if (typeof window !== "undefined" && window.LevelUpFirebaseConfig) {
    return window.LevelUpFirebaseConfig;
  }

  throw new Error("LevelUpFirebaseConfig nao foi configurado para o jogo standalone.");
}

export function getFirebaseApp() {
  return getApps().find((app) => app.name === GAME_FIREBASE_APP_NAME) ?? initializeApp(getFirebaseConfig(), GAME_FIREBASE_APP_NAME);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}
