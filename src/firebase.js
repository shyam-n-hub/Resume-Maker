// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAUOFu6V1064mXjnsal4dedF4LQIRgVOk",
  authDomain: "chattapp-b2703.firebaseapp.com",
  databaseURL: "https://chattapp-b2703-default-rtdb.firebaseio.com",
  projectId: "chattapp-b2703",
  storageBucket: "chattapp-b2703.appspot.com",
  messagingSenderId: "1083255756282",
  appId: "1:1083255756282:web:086fd8981012626fd4c043",
  measurementId: "G-L62Q1Z4Z35"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);