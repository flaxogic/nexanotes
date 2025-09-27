// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCzDy1BQYCyQUxB_JPpf3J0xXw-2--_419s",
  authDomain: "nexanotes-7d3b6.firebaseapp.com",
  projectId: "nexanotes-7d3b6",
  storageBucket: "nexanotes-7d3b6.firebasestorage.app",
  messagingSenderId: "514865716959",
  appId: "1:514865716959:web:4256ba406755c3fe25d36a",
  measurementId: "G-6Q3LS3XKEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them for use in other files
export const auth = getAuth(app);      // The authentication service
export const db = getFirestore(app);   // The Firestore database service