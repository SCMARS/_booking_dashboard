// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);