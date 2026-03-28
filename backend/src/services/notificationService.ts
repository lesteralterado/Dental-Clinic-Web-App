import { Notification, INotification } from '../models';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';
import { sendPushNotification, sendMultiplePushNotifications } from '../config/firebase';
import mongoose from 'mongoose';

export interface CreateNotificationData {
  userId: string;
  type: 'appointment' | 'reminder' | 'checkin' | 'payment' | 'system';
  title: string;
  body: string;
  fcmToken?: string;
  data?: Record<string, string>;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  unreadOnly?: boolean;
}

export const notificationService = {
  async create(data: CreateNotificationData): Promise<INotification> {
    const notification = await Notification.create(data);
    
    // Send push notification if FCM token is provided
    if (data.fcmToken) {
      try {
        await sendPushNotification(data.fcmToken, data.title, data.body, data.data);
      } catch (error) {
        logger.error('Failed to send push notification:', error);
      }
    }

    logger.info(`Notification created: ${notification._id}`);
    return notification;
  },

  async registerToken(userId: string, fcmToken: string): Promise<void> {
    // Store the token in the user's notification settings
    // In a real app, you'd have a separate FcmToken collection
    logger.info(`FCM token registered for user: ${userId}`);
  },

  async findAll(params: NotificationQueryParams): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const { page = 1, limit = 20, userId, unreadOnly } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    
    if (userId) query.userId = userId;
    if (unreadOnly) query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return { notifications, total, unreadCount };
  },

  async markAsRead(id: string): Promise<INotification> {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return notification;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  },

  async sendAppointmentNotification(
    userId: string,
    fcmToken: string | undefined,
    appointmentDetails: {
      patientName: string;
      date: Date;
      time: string;
    }
  ): Promise<INotification> {
    const title = 'New Appointment';
    const body = `New appointment scheduled with ${appointmentDetails.patientName} on ${appointmentDetails.date.toLocaleDateString()} at ${appointmentDetails.time}`;

    return this.create({
      userId,
      type: 'appointment',
      title,
      body,
      fcmToken,
      data: {
        type: 'appointment',
        patientName: appointmentDetails.patientName,
      },
    });
  },

  async sendReminderNotification(
    userId: string,
    fcmToken: string | undefined,
    appointmentDetails: {
      patientName: string;
      time: string;
      dentistName: string;
    }
  ): Promise<INotification> {
    const title = 'Appointment Reminder';
    const body = `Reminder: You have an appointment at ${appointmentDetails.time} with ${appointmentDetails.dentistName}`;

    return this.create({
      userId,
      type: 'reminder',
      title,
      body,
      fcmToken,
      data: {
        type: 'reminder',
        time: appointmentDetails.time,
      },
    });
  },

  async sendCheckInNotification(
    userId: string,
    fcmToken: string | undefined,
    patientName: string
  ): Promise<INotification> {
    const title = 'Patient Check-in';
    const body = `${patientName} has checked in for their appointment`;

    return this.create({
      userId,
      type: 'checkin',
      title,
      body,
      fcmToken,
      data: {
        type: 'checkin',
        patientName,
      },
    });
  },

  async deleteNotification(id: string): Promise<void> {
    const result = await Notification.findByIdAndDelete(id);
    
    if (!result) {
      throw new AppError('Notification not found', 404);
    }
  },

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });

    logger.info(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  },
};

export default notificationService;
