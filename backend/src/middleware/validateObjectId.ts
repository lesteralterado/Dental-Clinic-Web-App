import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from './error';

/**
 * Validates that a route parameter is a valid MongoDB ObjectId.
 * This prevents NoSQL injection attacks and invalid ID errors.
 * 
 * @param paramName - The name of the parameter to validate (default: 'id')
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id) {
      next();
      return;
    }
    
    // Check if valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: `Invalid ${paramName} format`,
        error: `The ${paramName} must be a valid MongoDB ObjectId`
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware to validate multiple ObjectId parameters
 * @param paramNames - Array of parameter names to validate
 */
export const validateObjectIds = (...paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (!id) {
        continue;
      }
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          message: `Invalid ${paramName} format`,
          error: `The ${paramName} must be a valid MongoDB ObjectId`
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Validates that a query parameter is a valid MongoDB ObjectId.
 * Use for query params like ?patientId=xxx
 */
export const validateQueryObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.query[paramName] as string;
    
    if (!value) {
      next();
      return;
    }
    
    // Handle comma-separated IDs
    const ids = value.split(',');
    
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id.trim())) {
        res.status(400).json({
          message: `Invalid ${paramName} format`,
          error: `The ${paramName} must be valid MongoDB ObjectId(s)`
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Validates that request body contains valid ObjectId(s)
 */
export const validateBodyObjectId = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[fieldName];
    
    if (!value) {
      next();
      return;
    }
    
    // Handle single ID or array of IDs
    const ids = Array.isArray(value) ? value : [value];
    
    for (const id of ids) {
      if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          message: `Invalid ${fieldName} format`,
          error: `The ${fieldName} must be a valid MongoDB ObjectId`
        });
        return;
      }
    }
    
    next();
  };
};

export default { validateObjectId, validateObjectIds, validateQueryObjectId, validateBodyObjectId };
