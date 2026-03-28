import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
// };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// VAPID key for web push notifications
export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

// Initialize Firebase app (only once)
let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

// Get or initialize Firebase app
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

// Get or initialize Firebase Messaging (client-side only)
export async function getFirebaseMessaging(): Promise<Messaging | undefined> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (!messaging) {
    const supported = await isSupported();
    if (supported) {
      app = getFirebaseApp();
      messaging = getMessaging(app);
    }
  }

  return messaging;
}

// Check if Firebase is properly configured
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

// Check if VAPID key is configured
export function isVapidKeyConfigured(): boolean {
  return !!vapidKey;
}

export default getFirebaseApp;