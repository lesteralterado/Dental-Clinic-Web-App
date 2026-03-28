// firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging
// Place this file in the public folder
// This runs in the service worker context and handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'REPLACE_API_KEY',
  authDomain: 'REPLACE_AUTH_DOMAIN',
  projectId: 'REPLACE_PROJECT_ID',
  storageBucket: 'REPLACE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_MESSAGING_SENDER_ID',
  appId: 'REPLACE_APP_ID',
});

const messaging = firebase.messaging({
  vapidKey: 'REPLACE_VAPID_KEY',
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Received background message:', payload);

  // Customize notification appearance
  const notificationTitle = payload.notification?.title || 'Dr. Debra Dental';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/2.png',
    badge: '/2.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open Dashboard' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification click:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the dashboard
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
    );
  }
});

// Handle push events (for when app is closed)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw] Push event:', event);
  
  const data = event.data?.json() || {};
  
  const notificationTitle = data.notification?.title || 'Dr. Debra Dental';
  const notificationOptions = {
    body: data.notification?.body || 'You have a new notification',
    icon: '/2.png',
    badge: '/2.png',
    tag: data.data?.type || 'default',
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Cache strategy for offline support
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw] Installing service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw] Activating service worker');
  event.waitUntil(clients.claim());
});