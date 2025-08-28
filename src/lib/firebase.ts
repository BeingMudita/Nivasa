import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3xxyMdMuaqW4-GsezyBP0j7tBXklugMg",
  authDomain: "nivasa-239f9.firebaseapp.com",
  projectId: "nivasa-239f9",
  storageBucket: "nivasa-239f9.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123xyz",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
