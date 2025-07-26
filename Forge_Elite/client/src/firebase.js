// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "forge-elite.firebaseapp.com",
  projectId: "forge-elite",
  storageBucket: "forge-elite.firebasestorage.app",
  messagingSenderId: "423194167225",
  appId: "1:423194167225:web:5cb3b796e2d529a7c95868"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);