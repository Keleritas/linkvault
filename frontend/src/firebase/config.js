import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApmlLXFA2lD-rfOs4PzISvGcgm5Dm5bvk",
  authDomain: "fullstack-268bc.firebaseapp.com",
  projectId: "fullstack-268bc",
  storageBucket: "fullstack-268bc.firebasestorage.app",
  messagingSenderId: "877418570377",
  appId: "1:877418570377:web:dffcf11ca7fb2ef7a69c58",
  measurementId: "G-PJ7VP9LPXS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);