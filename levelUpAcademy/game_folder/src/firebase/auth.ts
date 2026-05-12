import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, type User } from "firebase/auth";
import { firebaseAuth } from "./firebase";

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function ensureGameAuth(customToken?: string) {
  if (customToken) {
    const credential = await signInWithCustomToken(firebaseAuth, customToken);
    return credential.user;
  }
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const credential = await signInAnonymously(firebaseAuth);
  return credential.user;
}
