import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authenticate, requireStaff } from '../middleware/auth';
import { validate, registerTokenSchema } from '../middleware/validate';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Register FCM token for notifications
router.post('/register-token', requireStaff, validate(registerTokenSchema), (req, res) => notificationController.registerToken(req as any, res));

// Get notifications - only own user's notifications
router.get('/', requireStaff, (req, res) => notificationController.getAll(req as any, res));

// Mark as read
router.put('/:id/read', requireStaff, (req, res) => notificationController.markAsRead(req as any, res));
router.put('/read-all', requireStaff, (req, res) => notificationController.markAllAsRead(req as any, res));

export default router;
