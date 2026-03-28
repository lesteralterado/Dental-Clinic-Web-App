import { Router, Response } from 'express';
import authController from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, loginSchema, registerSchema } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), (req, res) => authController.login(req as any, res));

// Admin-only registration - no public registration allowed!
router.post('/register', authenticate, requireAdmin, validate(registerSchema), (req, res) => authController.register(req as any, res));

// Protected routes
router.get('/me', authenticate, (req, res) => authController.getProfile(req as any, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req as any, res));

export default router;
