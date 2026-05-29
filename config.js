// Replace these values with your Firebase project credentials
// Firebase Console → Project Settings → Your apps → SDK setup and configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhOYWAbiNGO2m72Cc2SSxqzhR__vIvf4A",
  authDomain: "reelrank-6fbd5.firebaseapp.com",
  projectId: "reelrank-6fbd5",
  storageBucket: "reelrank-6fbd5.firebasestorage.app",
  messagingSenderId: "155930209553",
  appId: "1:155930209553:web:6ecabb0b37770b269830b0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
