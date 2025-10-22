// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// This is the object from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyAdcp-fakBd1knHdeDXiuW_UXKgk8_LlPA",
  authDomain: "pastme-project.firebaseapp.com",
  projectId: "pastme-project",
  storageBucket: "pastme-project.firebaseapp.com",
  messagingSenderId: "79049801991",
  appId: "1:79049801991:web:4123b501d09039e1edc5a2",
  measurementId: "G-DXVJBXWYXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need in other files
export const auth = getAuth(app);
export const db = getFirestore(app);