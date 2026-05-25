import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
  type Persistence,
} from "firebase/auth";
import * as firebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyActCf4hKzTLaB4GMYskZc2wKZdZm_SEUA",
  authDomain: "levelup-8f123.firebaseapp.com",
  projectId: "levelup-8f123",
  storageBucket: "levelup-8f123.firebasestorage.app",
  messagingSenderId: "1057924564707",
  appId: "1:1057924564707:web:10acc01126e8f3b8d767d6",
  measurementId: "G-99YDJNH4F3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  try {
    if (Platform.OS === "web") {
      return initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    }

    const getReactNativePersistence = (firebaseAuth as typeof firebaseAuth & {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
    }).getReactNativePersistence;

    return initializeAuth(app, {
      persistence: getReactNativePersistence?.(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
