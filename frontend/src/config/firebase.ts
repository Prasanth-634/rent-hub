import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCOF2F5C8FswJ_bG1egmzRC7FQpmSQGAdc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rent-hub-8dea9.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rent-hub-8dea9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rent-hub-8dea9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '874819688480',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:874819688480:web:05fa2c72d0cdc4f56dc445',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QDJCZWXZV3'
};

// Initialize Firebase exactly once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
