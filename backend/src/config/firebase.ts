import admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Firebase admin instance
let firebaseAdmin: admin.app.App | null = null;

export const initializeFirebase = (): void => {
  if (admin.apps.length > 0) {
    firebaseAdmin = admin.apps[0];
    logger.info('Firebase Admin already initialized');
    return;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    logger.info('✅ Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
  }
};

export const getFirebaseAdmin = (): admin.app.App | null => {
  return firebaseAdmin;
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseAdmin) {
    logger.warn('Firebase Admin not initialized, cannot send notification');
    return;
  }

  try {
    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data,
    });
    logger.info(`Push notification sent to ${fcmToken.substring(0, 10)}...`);
  } catch (error) {
    logger.error('Failed to send push notification:', error);
  }
};

export const sendMultiplePushNotifications = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseAdmin) {
    logger.warn('Firebase Admin not initialized, cannot send notifications');
    return;
  }

  try {
    const messages = tokens.map(token => ({
      token,
      notification: {
        title,
        body,
      },
      data,
    }));

    await Promise.all(messages.map(msg => firebaseAdmin!.messaging().send(msg)));
    logger.info(`Push notifications sent to ${tokens.length} recipients`);
  } catch (error) {
    logger.error('Failed to send push notifications:', error);
  }
};

export default admin;
