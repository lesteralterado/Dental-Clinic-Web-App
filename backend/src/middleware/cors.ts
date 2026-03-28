import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Parse allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Fallback to FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    return [frontendUrl];
  }
  
  // Default to localhost for development
  return ['http://localhost:3000'];
};

// Pre-flight cache duration (24 hours)
const CORS_MAX_AGE = parseInt(process.env.CORS_MAX_AGE || '86400', 10);

// Allowed origins
const allowedOrigins = getAllowedOrigins();

// Dynamic origin validation with logging
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g., mobile apps or same-origin requests)
    if (!origin) {
      logger.debug('CORS: No origin provided, allowing request');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      logger.debug(`CORS: Origin ${origin} allowed`);
      return callback(null, true);
    }

    // Log rejected origins for security monitoring
    logger.warn(`CORS: Rejected origin ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
    
    // In development, allow all origins; in production, reject
    if (process.env.NODE_ENV === 'development') {
      logger.debug('CORS: Development mode - allowing origin');
      return callback(null, true);
    }

    // Production: reject the request
    return callback(new Error('Not allowed by CORS'), false);
  },
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
  ],
  
  // Exposed headers (accessible by client)
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  
  // Allow credentials (cookies, auth headers)
  credentials: true,
  
  // Pre-flight cache duration
  maxAge: CORS_MAX_AGE,
  
  // Handle options success
  optionsSuccessStatus: 204,
};

// Create the enhanced CORS middleware
const enhancedCors = cors(corsOptions);

// Log CORS configuration on startup
const logCorsConfig = () => {
  logger.info('CORS Configuration:');
  logger.info(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
  logger.info(`  Max Age: ${CORS_MAX_AGE} seconds`);
  logger.info(`  Credentials: enabled`);
  logger.info(`  Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`);
};

// Export CORS middleware and configuration
export { enhancedCors, corsOptions, logCorsConfig, allowedOrigins, CORS_MAX_AGE };

export default enhancedCors;