import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsNlDW6t8-gXWcIJT8_TB3AM1PSfo9IGA",
  authDomain: "://firebaseapp.com",
  projectId: "charnysweddingcountdown",
  storageBucket: "charnysweddingcountdown.firebasestorage.app",
  messagingSenderId: "707514674810",
  appId: "1:707514674810:web:31410881711bb28324d5c3",
  measurementId: "G-FB82FMHLJM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);