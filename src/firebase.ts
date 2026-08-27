import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWKdkj_otyp6JE3Xmsa4RMP36dwP1gcXM",
  authDomain: "japan2026-51309.firebaseapp.com",
  projectId: "japan2026-51309",
  storageBucket: "japan2026-51309.firebasestorage.app",
  messagingSenderId: "248913497709",
  appId: "1:248913497709:web:181d8b8ffdfb486d897964"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
