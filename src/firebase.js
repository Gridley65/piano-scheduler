// Firebase initialization.
//
// Fill in your own project's config below. You get these values from:
// Firebase console -> Project settings -> General -> "Your apps" -> SDK setup and config
//
// This file is safe to commit to a PUBLIC GitHub repo. Firebase web config
// values are not secret - access is controlled by Firestore Security Rules
// (see firestore.rules in this project), not by hiding this config.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDngs9Bu3oOXYDBx3iiUlMRKpoUdZ_uOvg",
  authDomain: "deborah-s-paino-studio.firebaseapp.com",
  projectId: "deborah-s-paino-studio",
  storageBucket: "deborah-s-paino-studio.firebasestorage.app",
  messagingSenderId: "517858375803",
  appId: "1:517858375803:web:94071145d157a629540ade"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
