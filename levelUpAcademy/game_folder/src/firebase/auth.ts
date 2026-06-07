import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, type User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function ensureGameAuth(customToken?: string) {
  const firebaseAuth = getFirebaseAuth();
  if (customToken) {
    const credential = await signInWithCustomToken(firebaseAuth, customToken);
    return credential.user;
  }
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const credential = await signInAnonymously(firebaseAuth);
  return credential.user;
}
