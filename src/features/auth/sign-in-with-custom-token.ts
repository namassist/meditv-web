import { signInWithCustomToken } from "firebase/auth";
import { firebaseAuth } from "./firebase-client";

export async function signInWithFirebaseCustomToken(
  customToken: string | null,
) {
  const token = customToken?.trim();
  if (!token) {
    throw new Error("customToken tidak tersedia untuk autentikasi Firebase.");
  }
  await signInWithCustomToken(firebaseAuth, token);
}
