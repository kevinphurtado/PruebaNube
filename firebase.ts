import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAi5jAdW2QfNzVZJFguuWRAEzA0zxuAWqU",
  authDomain: "nubi-84e91.firebaseapp.com",
  projectId: "nubi-84e91",
  storageBucket: "nubi-84e91.firebasestorage.app",
  messagingSenderId: "708464168191",
  appId: "1:708464168191:web:99f4379846aee02864d0ca",
  measurementId: "G-NKXR1EJRRG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);