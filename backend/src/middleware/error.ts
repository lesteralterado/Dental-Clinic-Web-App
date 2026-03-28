import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${err.stack}`);

  if (process.env.NODE_ENV === 'production' && !err.message) {
    res.status(statusCode).json({
      status: 'error',
      message: 'Something went wrong',
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { AppError, errorHandler, notFoundHandler, asyncHandler };
