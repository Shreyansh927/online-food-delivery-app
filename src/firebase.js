// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Import storage
// Don't use analytics unless you are hosting it on HTTPS + public domain

const firebaseConfig = {
  apiKey: "AIzaSyD1XiTydBQrkGi6Nade6CkLnjM_HwECNGI",
  authDomain: "login-auth-44423.firebaseapp.com",
  projectId: "login-auth-44423",
  storageBucket: "login-auth-44423.appspot.com", // ✅ storage bucket
  messagingSenderId: "733502020395",
  appId: "1:733502020395:web:239d06e233049442c0c36e",
  measurementId: "G-JGTRFBD8H2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
