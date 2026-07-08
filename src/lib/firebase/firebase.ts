/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// External libraries
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Internal imports
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  throw new Error(
    "Firebase configuration is missing. Make sure you have a .env file with all the required EXPO_PUBLIC_FIREBASE_ variables.",
  );
}

// Initialize Firebase app
let app: FirebaseApp;
if (!getApps().length) {
  console.log("[Firebase] Initializing Firebase app...");
  app = initializeApp(firebaseConfig);
  console.log("[Firebase] App initialized.");
} else {
  console.log("[Firebase] Using existing Firebase app instance.");
  app = getApp();
}

// Initialize Firebase services
const auth = firebaseAuth.initializeAuth(app, {
  persistence: (firebaseAuth as any).getReactNativePersistence(
    ReactNativeAsyncStorage,
  ),
});
const db = getFirestore(app);
const storage = getStorage(app);

console.log(
  "[Firebase] Firebase services obtained (Auth, Firestore, Storage).",
);

export { app, auth, db, storage };
