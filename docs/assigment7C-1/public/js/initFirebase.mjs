/**
 * @fileOverview  Initializing Cloud Firestore access
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";

// TODO: Replace the following with your web app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD937laCRt-wsIpJKtM8P_20DmWGCPpmG0",
  authDomain: "stroder-7a042.firebaseapp.com",
  projectId: "stroder-7a042",
  appId: "1:462739055140:web:5bdfe50fbd556c5710eeb1"
};
// Initialize a Firebase App object
initializeApp( firebaseConfig);
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

export { fsDb };
