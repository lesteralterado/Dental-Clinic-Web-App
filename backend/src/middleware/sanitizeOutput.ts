import { Response, NextFunction } from 'express';
import { escapeHtml, sanitizeString } from '../utils/sanitizer';

/**
 * Output Sanitization Middleware
 * 
 * Sanitizes all outgoing API responses to prevent XSS attacks
 * via malicious content stored in the database.
 */

interface sanitizableResponse {
  [key: string]: unknown;
}

/**
 * Recursively sanitizes all string values in an object.
 * This prevents XSS via stored malicious content.
 * 
 * @param obj - The object to sanitize
 * @param fieldsToSkip - Fields to skip (like already-encoded HTML)
 * @returns Sanitized object
 */
const sanitizeObject = (obj: unknown, fieldsToSkip: string[] = []): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, fieldsToSkip));
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip certain fields that should contain raw content (like HTML previews)
      if (fieldsToSkip.includes(key)) {
        sanitized[key] = value;
      } else if (typeof value === 'string') {
        // Sanitize strings
        sanitized[key] = escapeHtml(sanitizeString(value));
      } else if (typeof value === 'object') {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(value, fieldsToSkip);
      } else {
        // Keep other types as-is
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  // Return primitives as-is
  return obj;
};

/**
 * Express middleware that sanitizes all JSON responses.
 * 
 * This middleware should be applied AFTER the route handler but BEFORE
 * the response is sent. Since Express doesn't have a built-in way to 
 * intercept all responses, this provides a helper function to use in controllers.
 * 
 * Usage in controller:
 * ```typescript
 * const result = await service.getData();
 * res.json(sanitizeResponse(result));
 * ```
 */
export const sanitizeResponse = (data: unknown): unknown => {
  // Skip sanitization for certain response types
  if (data === null || data === undefined) {
    return data;
  }
  
  // Skip if already sanitized
  if (typeof data === 'string') {
    return data;
  }
  
  // Skip for error responses
  if (data && typeof data === 'object' && 'isSanitized' in (data as Record<string, unknown>)) {
    return data;
  }
  
  // Sanitize the response data
  return sanitizeObject(data);
};

/**
 * Creates a middleware that sanitizes response data.
 * Note: This only works if you call the next middleware with sanitized data.
 * For better protection, use sanitizeResponse() directly in controllers.
 */
export const responseSanitizer = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to sanitize responses
    res.json = (data: unknown): Response => {
      const sanitized = sanitizeResponse(data);
      return originalJson(sanitized);
    };
    
    next();
  };
};

/**
 * Sanitizes specific sensitive fields that should NOT be displayed.
 * Useful for removing password hashes, tokens, etc. from responses.
 * 
 * @param data - The response data
 * @param fieldsToRemove - Array of field names to remove
 * @returns Sanitized data with sensitive fields removed
 */
export const removeSensitiveFields = (data: unknown, fieldsToRemove: string[]): unknown => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => removeSensitiveFields(item, fieldsToRemove));
  }
  
  if (typeof data === 'object') {
    const result = { ...(data as Record<string, unknown>) };
    
    for (const field of fieldsToRemove) {
      delete result[field];
    }
    
    // Also check nested objects
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = removeSensitiveFields(value, fieldsToRemove);
      }
    }
    
    return result;
  }
  
  return data;
};

/**
 * Common sensitive fields to remove from responses
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'salt',
  'token',
  'refreshToken',
  'accessToken',
  'apiKey',
  'secret',
  'firebaseKey',
];

export default {
  sanitizeResponse,
  responseSanitizer,
  removeSensitiveFields,
  SENSITIVE_FIELDS,
};
