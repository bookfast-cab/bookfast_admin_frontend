// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M",
  authDomain: "bookfast-cabs.firebaseapp.com",
  databaseURL: "https://bookfast-cabs-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bookfast-cabs",
  storageBucket: "bookfast-cabs.firebasestorage.app",
  messagingSenderId: "4775156353",
  appId: "1:4775156353:web:f02b6ccdf78c6cba914b80",
  measurementId: "G-4SD2DED5P1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

//const analytics = getAnalytics(app);