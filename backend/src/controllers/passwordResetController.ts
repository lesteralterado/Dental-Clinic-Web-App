import { Request, Response } from 'express';
import passwordResetService from '../services/passwordResetService';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';

// ==========================================
// Password Reset Controller
// ==========================================

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send password reset email
 */
const sendResetEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    // Get frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // Create transporter
    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@dentalclinic.com',
      to: email,
      subject: 'Password Reset Request - Dr. Debra Dental Clinic',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested a password reset for your Dr. Debra Dental Clinic account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This link will expire in 1 hour for security purposes.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">
            Dr. Debra Dental Clinic<br>
            This is an automated message, please do not reply directly.
          </p>
        </div>
      `,
      text: `You requested a password reset for your Dr. Debra Dental Clinic account. Please visit ${resetUrl} to reset your password. This link will expire in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * POST /api/auth/forgot-password
 * Request a password reset
 */
export const requestReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Request password reset
    const token = await passwordResetService.requestPasswordReset(email);

    // Always return success to prevent email enumeration
    // If user exists and token was generated, send email
    if (token) {
      // Try to send email (log error but don't expose to user)
      const emailSent = await sendResetEmail(email, token);
      if (!emailSent) {
        logger.warn(`Failed to send reset email to ${email}, but token was generated`);
      }
    }

    // Return generic success message
    res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Error in requestReset:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // Reset password
    const result = await passwordResetService.resetPassword(token, newPassword);

    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    res.status(200).json({ message: result.message });
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

/**
 * GET /api/auth/validate-reset-token
 * Validate a reset token without consuming it
 */
export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Token is required', valid: false });
      return;
    }

    const result = await passwordResetService.getResetTokenStatus(token);

    res.status(200).json({
      valid: result.valid,
      message: result.message,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    logger.error('Error in validateToken:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.', valid: false });
  }
};

export default {
  requestReset,
  resetPassword,
  validateToken,
};