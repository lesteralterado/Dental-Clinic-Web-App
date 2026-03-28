import { Router } from 'express';
import patientController from '../controllers/patientController';
import { authenticate, requireAdmin, requireStaff, requireDoctorOrAbove } from '../middleware/auth';
import { validate, createPatientSchema, updatePatientSchema } from '../middleware/validate';
import { validateObjectId } from '../middleware/validateObjectId';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Public search and QR lookup - requires staff (all roles can search)
router.get('/search', requireStaff, (req, res) => patientController.search(req as any, res));
router.get('/identify/qr', requireStaff, (req, res) => patientController.findByQrCode(req as any, res));

// Read operations - all staff can view
router.get('/', requireStaff, (req, res) => patientController.getAll(req as any, res));
router.get('/recent', requireStaff, (req, res) => patientController.getRecent(req as any, res));
router.get('/frequent', requireStaff, (req, res) => patientController.getFrequent(req as any, res));

// Individual patient operations - with ObjectId validation
router.get('/:id', requireStaff, validateObjectId('id'), (req, res) => patientController.getById(req as any, res));
router.get('/:id/qr', requireStaff, validateObjectId('id'), (req, res) => patientController.getQrCode(req as any, res));

// Create - staff can create patients
router.post('/', requireStaff, validate(createPatientSchema), (req, res) => patientController.create(req as any, res));

// Update - staff can update
router.put('/:id', requireStaff, validateObjectId('id'), validate(updatePatientSchema), (req, res) => patientController.update(req as any, res));

// Delete - ADMIN ONLY!
router.delete('/:id', requireAdmin, validateObjectId('id'), (req, res) => patientController.delete(req as any, res));

export default router;
