import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { authenticate, requireAdmin, requireStaff } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Stats - ADMIN ONLY (contains sensitive revenue data)
router.get('/stats', requireAdmin, (req, res) => dashboardController.getStats(req as any, res));

// Today's appointments - all staff can view
router.get('/appointments/today', requireStaff, (req, res) => dashboardController.getTodayAppointments(req as any, res));

export default router;
