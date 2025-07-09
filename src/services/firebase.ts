import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import { Platform } from 'react-native';

// Your web app's Firebase configuration, now loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  throw new Error('Firebase configuration is missing. Make sure you have a .env file with all the required EXPO_PUBLIC_FIREBASE_ variables.');
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  console.log('[Firebase] Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] App initialized.');
} else {
  console.log('[Firebase] Using existing Firebase app instance.');
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (conditionally based on support)
let analytics;
if (Platform.OS === 'web') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
            console.log('[Firebase] Analytics initialized.');
        } else {
            console.log('[Firebase] Analytics is not supported in this environment.');
        }
    });
} else {
    console.log('[Firebase] Analytics initialization skipped for native platform.');
}

console.log('[Firebase] Firebase services obtained (Auth, Firestore, Storage).');

export { app, auth, db, storage, analytics };