import { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { alertService } from '../services/alertService';

// Error codes for better client-side handling
export enum ErrorCode {
  // General errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  
  // Database errors
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_VALIDATION_ERROR = 'DB_VALIDATION_ERROR',
  DB_DUPLICATE_KEY = 'DB_DUPLICATE_KEY',
  DB_INVALID_ID = 'DB_INVALID_ID',
  
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  
  // Business logic errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

// Standardized API response interfaces
export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  status: 'success';
  data?: T;
  message?: string;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: ErrorCode;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper to generate request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Attach request ID to request object
export const requestIdMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Parse MongoDB errors and convert to AppError
export const parseMongoError = (error: any): AppError => {
  // Handle Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return new AppError(
      'Invalid ID format',
      400,
      ErrorCode.DB_INVALID_ID,
      { field: error.path }
    );
  }
  
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors || {}).map(
      (err: any) => ({
        field: err.path,
        message: err.message,
      })
    );
    return new AppError(
      'Database validation failed',
      400,
      ErrorCode.DB_VALIDATION_ERROR,
      validationErrors
    );
  }
  
  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'unknown';
    return new AppError(
      `A record with this ${field} already exists`,
      409,
      ErrorCode.DB_DUPLICATE_KEY,
      { field, value: error.keyValue }
    );
  }
  
  // Handle connection errors
  if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
    return new AppError(
      'Database temporarily unavailable',
      503,
      ErrorCode.DB_CONNECTION_ERROR
    );
  }
  
  // Default to internal error
  return new AppError(
    error.message || 'Database operation failed',
    500,
    ErrorCode.INTERNAL_SERVER_ERROR
  );
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).requestId || 'unknown';
  
  // Check if it's our custom AppError
  if (err instanceof AppError) {
    // Track error for alert rate limiting
    alertService.trackError();
    
    logger.error(`[${requestId}] Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      path: req.path,
      method: req.method,
    });
    
    const response: ApiErrorResponse = {
      status: 'error',
      error: {
        code: err.errorCode,
        message: err.message,
        requestId,
      },
    };
    
    if (err.details && process.env.NODE_ENV !== 'production') {
      response.error.details = err.details;
    }
    
    res.status(err.statusCode).json(response);
    return;
  }
  
  // Check for Mongoose/MongoDB errors
  if (err.name && err.name.startsWith('Mongo') || (err as any).kind) {
    const mongoError = parseMongoError(err);
    
    // Track error for alert rate limiting
    alertService.trackError();
    
    logger.error(`[${requestId}] MongoDB error: ${err.message}`, {
      errorName: err.name,
      path: req.path,
    });
    
    const response: ApiErrorResponse = {
      status: 'error',
      error: {
        code: mongoError.errorCode,
        message: mongoError.message,
        requestId,
      },
    };
    
    if (mongoError.details && process.env.NODE_ENV !== 'production') {
      response.error.details = mongoError.details;
    }
    
    res.status(mongoError.statusCode).json(response);
    return;
  }
  
  // Handle Joi validation errors passed from middleware
  if ((err as any).isJoi || (err as any).name === 'ValidationError') {
    const validationError = err as any;
    const errors = validationError.details?.map((detail: any) => ({
      field: detail.path?.join('.'),
      message: detail.message,
    })) || [{ message: validationError.message }];
    
    logger.error(`[${requestId}] Validation error: ${err.message}`, {
      errors,
      path: req.path,
    });
    
    res.status(400).json({
      status: 'error',
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Request validation failed',
        details: errors,
        requestId,
      },
    } as ApiErrorResponse);
    return;
  }
  
  // Handle unknown errors
  logger.error(`[${requestId}] Unexpected error: ${err.stack}`, {
    path: req.path,
    method: req.method,
  });
  
  // In production, hide error details
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
        requestId,
      },
    } as ApiErrorResponse);
  } else {
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: err.message,
        stack: err.stack,
        requestId,
      },
    } as ApiErrorResponse);
  }
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.warn(`[${requestId}] Route not found: ${req.originalUrl}`, {
    method: req.method,
    path: req.path,
  });
  
  res.status(404).json({
    status: 'error',
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.originalUrl} not found`,
      requestId,
    },
  } as ApiErrorResponse);
};

export const asyncHandler = <T extends RequestHandler = RequestHandler>(
  fn: T
): T => {
  return ((req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      // Handle known error types
      if (error instanceof AppError) {
        next(error);
        return;
      }
      
      // Handle Mongoose errors
      if (error instanceof mongoose.Error || error.name?.startsWith('Mongo')) {
        next(parseMongoError(error));
        return;
      }
      
      // Pass unknown errors to error handler
      next(error);
    });
  }) as T;
};

export default {
  ErrorCode,
  AppError,
  requestIdMiddleware,
  parseMongoError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
