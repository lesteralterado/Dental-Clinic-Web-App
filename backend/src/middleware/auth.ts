import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  user?: IUser;
}

// Audit log interface
export interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  resource: 'patient' | 'appointment' | 'user' | 'payment' | 'auth';
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// In-memory audit log storage (use database in production)
const auditLogs: IAuditLog[] = [];

export const logAudit = (
  userId: mongoose.Types.ObjectId | string,
  action: IAuditLog['action'],
  resource: IAuditLog['resource'],
  req: AuthRequest,
  resourceId?: string,
  details?: Record<string, unknown>
): void => {
  const auditLog: IAuditLog = {
    userId: new mongoose.Types.ObjectId(userId),
    action,
    resource,
    resourceId,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    details,
    timestamp: new Date(),
  };
  
  auditLogs.push(auditLog);
  
  // Log to file as well
  logger.info(`AUDIT: User ${userId} performed ${action} on ${resource}${resourceId ? ` (${resourceId})` : ''}`);
};

export const getAuditLogs = (filters?: {
  userId?: string;
  action?: IAuditLog['action'];
  resource?: IAuditLog['resource'];
  startDate?: Date;
  endDate?: Date;
}): IAuditLog[] => {
  let logs = [...auditLogs];
  
  if (filters?.userId) {
    logs = logs.filter(log => log.userId.toString() === filters.userId);
  }
  if (filters?.action) {
    logs = logs.filter(log => log.action === filters.action);
  }
  if (filters?.resource) {
    logs = logs.filter(log => log.resource === filters.resource);
  }
  if (filters?.startDate) {
    logs = logs.filter(log => log.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    logs = logs.filter(log => log.timestamp <= filters.endDate!);
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('FATAL: JWT_SECRET environment variable is not set!');
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { userId: string };

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: 'Account is disabled' });
      return;
    }

    // Attach user to request
    req.user = user;
    
    // Log successful authentication
    logAudit(user._id, 'READ', 'auth', req, undefined, { action: 'token_validated' });
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      logAudit(
        req.user._id, 
        'READ', 
        'auth', 
        req, 
        undefined, 
        { 
          action: 'unauthorized_access_attempt',
          requiredRoles: roles,
          userRole: req.user.role,
          path: req.path,
          method: req.method
        }
      );
      
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware - restricts access to admin users only
 */
export const requireAdmin = authorize('admin');

/**
 * Doctor or above middleware - restricts to admin and doctor roles
 */
export const requireDoctorOrAbove = authorize('admin', 'doctor');

/**
 * Staff middleware - restricts to admin, doctor, and receptionist
 * This is the default for most routes
 */
export const requireStaff = authorize('admin', 'doctor', 'receptionist');

export const generateToken = (userId: string): string => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'; // Reduced from 7d for better security
  
  return jwt.sign({ userId }, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export default { 
  authenticate, 
  authorize, 
  requireAdmin, 
  requireDoctorOrAbove, 
  requireStaff,
  generateToken, 
  logAudit,
  getAuditLogs
};
