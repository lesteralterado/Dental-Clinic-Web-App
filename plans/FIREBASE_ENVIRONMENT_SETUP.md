# Firebase Environment Variables Setup Guide

This document explains how to configure Firebase Cloud Messaging for your dental clinic application.

## Required Environment Variables

Add the following to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase VAPID Key (for web push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_public_key
```

## How to Get Firebase Credentials

### Step 1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "dental-clinic-app")

### Step 2: Add Your Web App
1. In the Firebase console, click the web icon `</>` to add a web app
2. Register your app (e.g., "Dental Clinic Admin")
3. Copy the Firebase config object values

### Step 3: Enable Cloud Messaging
1. In the left sidebar, go to "Grow" → "Cloud Messaging"
2. Click "Get started" if not already enabled
3. Generate a Web Push Certificates key pair:
   - Click the settings gear icon next to "Cloud Messaging API"
   - Under "Web configuration", click "Generate key pair"
   - Copy the public key - this is your `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Step 4: Copy Credentials
Your Firebase config will look like this:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "dental-clinic.firebaseapp.com",
  projectId: "dental-clinic",
  storageBucket: "dental-clinic.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
}
```

Map these to your environment variables:
- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

## Testing Your Setup

After adding the environment variables:

1. Restart your development server
2. Open the dashboard in your browser
3. The app will automatically request notification permission
4. Check the browser console for any configuration errors

## Production Considerations

1. **HTTPS Required**: Push notifications only work on HTTPS sites (or localhost)
2. **Service Worker**: The service worker at `public/firebase-messaging-sw.js` handles background notifications
3. **Token Management**: FCM tokens are stored in localStorage for demo purposes. In production, consider storing tokens in your database

## Troubleshooting

### Notifications not working?
- Check that permission is granted in browser settings
- Verify all environment variables are set correctly
- Check browser console for errors

### Service worker not loading?
- Ensure `firebase-messaging-sw.js` is in the `public` folder
- Check that the file is accessible at `/firebase-messaging-sw.js`

### VAPID key error?
- Ensure you've generated a Web Push Certificate in Firebase Console
- Verify the VAPID key starts with "BPd..." or similar