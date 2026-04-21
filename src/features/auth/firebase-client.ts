import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseWebConfig } from "@/shared/config/app-config";

const app = getApps().length ? getApp() : initializeApp(getFirebaseWebConfig());

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
