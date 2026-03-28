import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// ==========================================
// Enhanced Rate Limiting Configuration
// ==========================================

// General API limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 900, // seconds
    });
  },
});

// Auth-specific limiter - 5 requests per 15 minutes (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email || 'unknown'}`);
    res.status(429).json({
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 900,
    });
  },
});

// Login-specific limiter - 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email || 'unknown'}`);
    res.status(429).json({
      message: 'Too many login attempts, please try again later.',
      retryAfter: 900,
    });
  },
});

// Password reset limiter - 3 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email || 'unknown'}`);
    res.status(429).json({
      message: 'Too many password reset requests. Please try again in an hour.',
      retryAfter: 3600,
    });
  },
});

// Strict limiter for sensitive operations - 10 requests per minute
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many requests for this operation, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      message: 'Too many requests for this operation, please slow down.',
      retryAfter: 60,
    });
  },
});

// Write operation limiter - 30 requests per minute (create, update, delete)
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many write operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Write operation rate limit exceeded for IP: ${req.ip}, Method: ${req.method}, Path: ${req.path}`);
    res.status(429).json({
      message: 'Too many write operations, please try again later.',
      retryAfter: 60,
    });
  },
});

// Custom rate limiter factory for specific needs
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip || 'unknown'),
  });
};

export default {
  apiLimiter,
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  strictLimiter,
  writeLimiter,
  createRateLimiter,
};