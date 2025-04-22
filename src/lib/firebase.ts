import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration (from user input)
const firebaseConfig = {
  apiKey: "AIzaSyAlF3Lp-5CO8ekOCvnJNNLx7d-Exz9eQYY",
  authDomain: "rusty-7faf0.firebaseapp.com",
  projectId: "rusty-7faf0",
  storageBucket: "rusty-7faf0.appspot.com",
  messagingSenderId: "310839285582",
  appId: "1:310839285582:web:af6adf9d9690cc276eb01f",
  measurementId: "G-Y28NYTD1LY"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  console.log('[Firebase] Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] App initialized. getAuth will attempt implicit persistence.');
} else {
  console.log('[Firebase] Using existing Firebase app instance.');
  app = getApp();
}

// getAuth should attempt to configure persistence automatically if AsyncStorage is available
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