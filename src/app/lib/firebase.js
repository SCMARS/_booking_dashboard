// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEv2_HfE0VauvaPecZ3N9aAmwEAzRnrw4",
    authDomain: "booking-2c3e1.firebaseapp.com",
    projectId: "booking-2c3e1",
    storageBucket: "booking-2c3e1.firebasestorage.app",
    messagingSenderId: "373888935111",
    appId: "1:373888935111:web:7c4b350d812323c75bcae2",
    measurementId: "G-ZBFVMZ9VW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
