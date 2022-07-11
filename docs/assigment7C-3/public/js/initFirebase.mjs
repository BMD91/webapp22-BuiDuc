/**
 * @fileOverview  Initializing Firebase Project, Cloud Firestore & Authentication Instances
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
import { initializeApp, getApp, getApps }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getFirestore }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore-lite.js";
import { getAuth }
  from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js";

// TODO: Replace the following with your web app's Firebase project configuration
const config = {
  apiKey: "AIzaSyD937laCRt-wsIpJKtM8P_20DmWGCPpmG0",
  authDomain: "stroder-7a042.firebaseapp.com",
  projectId: "stroder-7a042",
  appId: "1:462739055140:web:5bdfe50fbd556c5710eeb1"
};
// Initialize a Firebase App object only if not already initialized
const app = (!getApps().length) ? initializeApp( config ) : getApp();
// Initialize Firebase Authentication
const auth = getAuth( app);
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

export { auth, fsDb };
