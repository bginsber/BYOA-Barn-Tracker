import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, RecaptchaVerifier, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

// Add type declaration for window.recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Validate config
const configErrors = [];
if (!FIREBASE_API_KEY) configErrors.push('FIREBASE_API_KEY');
if (!FIREBASE_AUTH_DOMAIN) configErrors.push('FIREBASE_AUTH_DOMAIN');
if (!FIREBASE_PROJECT_ID) configErrors.push('FIREBASE_PROJECT_ID');
if (!FIREBASE_STORAGE_BUCKET) configErrors.push('FIREBASE_STORAGE_BUCKET');
if (!FIREBASE_MESSAGING_SENDER_ID) configErrors.push('FIREBASE_MESSAGING_SENDER_ID');
if (!FIREBASE_APP_ID) configErrors.push('FIREBASE_APP_ID');

if (configErrors.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${configErrors.join(', ')}`);
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

console.log('Firebase Config:', { 
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain 
});

let app;
let db: Firestore;
let auth: Auth;

// Create recaptcha container first if we're on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const existingContainer = document.getElementById('recaptcha-container');
  if (!existingContainer) {
    const container = document.createElement('div');
    container.id = 'recaptcha-container';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.right = '0';
    container.style.opacity = '0.95';
    document.body.appendChild(container);
    console.warn('✅ Created recaptcha container');
  }
}

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');

  // Initialize Auth
  auth = getAuth(app);
  console.log('✅ Auth initialized');

  // Set up reCAPTCHA verifier for web platform
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.warn('🌐 Setting up reCAPTCHA verifier for web...');
    
    // For development only - remove in production!
    if (__DEV__) {
      console.warn('⚠️ Development mode: Disabling app verification');
      // @ts-ignore - settings exists but TypeScript doesn't know about it
      auth.settings.appVerificationDisabledForTesting = true;
    }

    const container = document.getElementById('recaptcha-container');
    if (container) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        container,
        {
          size: 'invisible',
          callback: (response: any) => {
            console.warn('✅ reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA expired');
          }
        }
      );
      console.warn('✅ RecaptchaVerifier initialized successfully');
    }
  }

  // Listen for auth state changes
  auth.onAuthStateChanged(
    (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid} logged in` : 'No user');
    },
    (error) => {
      console.error('Auth state change error:', error);
    }
  );

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { db, auth }; 