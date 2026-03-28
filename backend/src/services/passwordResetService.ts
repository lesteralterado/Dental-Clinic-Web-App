import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

// Token configuration
const TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters
const TOKEN_EXPIRY_HOURS = 1;
const MAX_PASSWORD_HISTORY = 5;
const PASSWORD_HISTORY_SALT_ROUNDS = 10;

// ==========================================
// Password Reset Service
// ==========================================

/**
 * Generate a cryptographically secure reset token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
};

/**
 * Hash the reset token for storage (never store plain tokens)
 */
export const hashResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Request a password reset
 * Returns the plain token (to send via email) if successful
 * Returns null if user not found (to prevent email enumeration)
 */
export const requestPasswordReset = async (email: string): Promise<string | null> => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Password reset requested for inactive user: ${email}`);
      return null;
    }

    // Generate and hash token
    const plainToken = generateResetToken();
    const hashedToken = hashResetToken(plainToken);
    
    // Set expiry (1 hour from now)
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Update user with reset token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    logger.info(`Password reset token generated for user: ${email}`);

    // Return the plain token (caller should send via email)
    return plainToken;
  } catch (error) {
    logger.error('Error requesting password reset:', error);
    // Return null to prevent enumeration
    return null;
  }
};

/**
 * Validate a password reset token
 * Returns the user if valid, null otherwise
 */
export const validateResetToken = async (token: string): Promise<IUser | null> => {
  try {
    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      isActive: true,
    });

    if (!user) {
      logger.debug('Invalid reset token - user not found');
      return null;
    }

    // Check if token has expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      logger.debug('Reset token has expired');
      // Clear expired token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return null;
    }

    return user;
  } catch (error) {
    logger.error('Error validating reset token:', error);
    return null;
  }
};

/**
 * Check if password has been used before (prevent reuse)
 */
const isPasswordInHistory = async (user: IUser, newPassword: string): Promise<boolean> => {
  if (!user.passwordHistory || user.passwordHistory.length === 0) {
    return false;
  }

  for (const historyEntry of user.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, historyEntry.password);
    if (isMatch) {
      return true;
    }
  }

  return false;
};

/**
 * Add password to history
 */
const addPasswordToHistory = async (user: IUser, password: string): Promise<void> => {
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, PASSWORD_HISTORY_SALT_ROUNDS);

  const historyEntry = {
    password: hashedPassword,
    changedAt: new Date(),
  };

  // Add to beginning of array
  user.passwordHistory = [historyEntry, ...(user.passwordHistory || [])];

  // Keep only the last MAX_PASSWORD_HISTORY entries
  if (user.passwordHistory.length > MAX_PASSWORD_HISTORY) {
    user.passwordHistory = user.passwordHistory.slice(0, MAX_PASSWORD_HISTORY);
  }
};

/**
 * Reset password using a valid token
 * Returns true if successful
 */
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate token and get user
    const user = await validateResetToken(token);

    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      };
    }

    // Check password history
    const isReused = await isPasswordInHistory(user, newPassword);
    if (isReused) {
      return {
        success: false,
        message: `Password cannot be one of your last ${MAX_PASSWORD_HISTORY} passwords. Please choose a different password.`,
      };
    }

    // Add current password to history before changing
    await addPasswordToHistory(user, user.password);

    // Update password (the pre-save hook will hash it)
    user.password = newPassword;
    
    // Clear reset token and expiry
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Reset failed login attempts on successful password change
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    logger.info(`Password successfully reset for user: ${user.email}`);

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  } catch (error) {
    logger.error('Error resetting password:', error);
    return {
      success: false,
      message: 'An error occurred while resetting your password. Please try again.',
    };
  }
};

/**
 * Invalidate all reset tokens for a user
 * Called when user successfully logs in or changes password manually
 */
export const invalidateAllResetTokens = async (userId: string): Promise<void> => {
  try {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
    logger.debug(`Reset tokens invalidated for user: ${userId}`);
  } catch (error) {
    logger.error('Error invalidating reset tokens:', error);
  }
};

/**
 * Get password reset status (for checking if token is valid without validating)
 */
export const getResetTokenStatus = async (token: string): Promise<{ valid: boolean; expiresAt?: Date; message: string }> => {
  try {
    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      isActive: true,
    }).select('resetPasswordExpires email');

    if (!user) {
      return {
        valid: false,
        message: 'Invalid reset token.',
      };
    }

    if (!user.resetPasswordExpires) {
      return {
        valid: false,
        message: 'Reset token not found.',
      };
    }

    if (user.resetPasswordExpires < new Date()) {
      return {
        valid: false,
        message: 'Reset token has expired.',
      };
    }

    return {
      valid: true,
      expiresAt: user.resetPasswordExpires,
      message: 'Reset token is valid.',
    };
  } catch (error) {
    logger.error('Error getting reset token status:', error);
    return {
      valid: false,
      message: 'Error checking reset token.',
    };
  }
};

export default {
  generateResetToken,
  hashResetToken,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  invalidateAllResetTokens,
  getResetTokenStatus,
};