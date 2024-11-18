// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Import Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyCkMCsdkKmgqUBr9qxlCzcxxKMs-FlSV5c",
  authDomain: "resume-249a8.firebaseapp.com",
  projectId: "resume-249a8",
  storageBucket: "resume-249a8.appspot.com",
  messagingSenderId: "738707452667",
  appId: "1:738707452667:web:a31b168bc2d3dd9bc5765e",
  measurementId: "G-3H77PQLZ6P",
  databaseURL: "https://resume-249a8-default-rtdb.firebaseio.com/", // Add Realtime Database URL
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore (if still used elsewhere)
const database = getDatabase(app); // Realtime Database

export { auth, db, database };
