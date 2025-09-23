// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


function assertFirebaseEnv(config) {
    const missing = Object.entries(config)
        .filter(([, v]) => !v)
        .map(([k]) => k);
    if (missing.length) {

        console.warn(`[firebase] Missing env vars: ${missing.join(", ")}`);
    }
}

assertFirebaseEnv(firebaseConfig);


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const db = getFirestore(app);

export default app;
