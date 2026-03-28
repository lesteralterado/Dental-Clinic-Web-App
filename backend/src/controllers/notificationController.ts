import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';

export const notificationController = {
  async registerToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fcmToken } = req.body;
      await notificationService.registerToken(req.user!._id.toString(), fcmToken);
      res.json({ message: 'FCM token registered' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, unreadOnly } = req.query;
      const result = await notificationService.findAll({
        page: Number(page),
        limit: Number(limit),
        userId: req.user!._id.toString(),
        unreadOnly: unreadOnly === 'true',
      });
      res.json({
        notifications: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.json({ message: 'Notification marked as read', notification });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!._id.toString());
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

export default notificationController;
