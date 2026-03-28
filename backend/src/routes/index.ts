import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import appointmentRoutes from './appointments';
import notificationRoutes from './notifications';
import dashboardRoutes from './dashboard';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
