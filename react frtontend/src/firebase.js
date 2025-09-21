// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyADB-9Gsntlqg0DsMPMWcEOeOynjCPz_DM",
  authDomain: "hack2skill-emt.firebaseapp.com",
  projectId: "hack2skill-emt",
  storageBucket: "hack2skill-emt.firebasestorage.app",
  messagingSenderId: "580643503196",
  appId: "1:580643503196:web:9614c0f23215218ceb3a99",
  databaseURL: "https://hack2skill-emt-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
