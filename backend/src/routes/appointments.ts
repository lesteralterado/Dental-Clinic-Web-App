import { Router } from 'express';
import appointmentController from '../controllers/appointmentController';
import { authenticate, requireAdmin, requireStaff, requireDoctorOrAbove } from '../middleware/auth';
import { validate, createAppointmentSchema } from '../middleware/validate';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

// Read operations - all staff can view
router.get('/', requireStaff, (req, res) => appointmentController.getAll(req as any, res));
router.get('/today', requireStaff, (req, res) => appointmentController.getToday(req as any, res));
router.get('/week', requireStaff, (req, res) => appointmentController.getWeek(req as any, res));
router.get('/:id', requireStaff, (req, res) => appointmentController.getById(req as any, res));

// Create and check-in - staff can do
router.post('/', requireStaff, validate(createAppointmentSchema), (req, res) => appointmentController.create(req as any, res));
router.post('/:id/checkin', requireStaff, (req, res) => appointmentController.checkIn(req as any, res));

// QR check-in - public endpoint for self check-in (no auth required)
router.get('/checkin', (req, res) => appointmentController.checkInByQr(req as any, res));

// Update - doctors and admins can update appointments
router.put('/:id', requireDoctorOrAbove, (req, res) => appointmentController.update(req as any, res));

// Cancel - doctors, admins, and receptionists can cancel
router.delete('/:id', requireStaff, (req, res) => appointmentController.cancel(req as any, res));

export default router;
