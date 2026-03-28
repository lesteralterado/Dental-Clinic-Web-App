import { Router, Response } from 'express';
import authController from '../controllers/authController';
import passwordResetController from '../controllers/passwordResetController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validate';
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimit';

const router = Router();

// Public routes with rate limiting
router.post('/login', loginLimiter, validate(loginSchema), (req, res) => authController.login(req as any, res));

// Password reset routes with rate limiting
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), (req, res) => 
  passwordResetController.requestReset(req as any, res));
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), (req, res) => 
  passwordResetController.resetPassword(req as any, res));
router.get('/validate-reset-token', (req, res) => 
  passwordResetController.validateToken(req as any, res));

// Admin-only registration - no public registration allowed!
router.post('/register', authenticate, requireAdmin, validate(registerSchema), (req, res) => authController.register(req as any, res));

// Protected routes
router.get('/me', authenticate, (req, res) => authController.getProfile(req as any, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req as any, res));

export default router;
