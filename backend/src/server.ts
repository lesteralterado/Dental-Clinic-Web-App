import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { startReminderJob, startCleanupJob } from './jobs/reminders';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

let server: ReturnType<typeof app.listen>;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize Firebase (optional - won't fail if not configured)
    try {
      initializeFirebase();
    } catch (error) {
      logger.warn('Firebase initialization skipped - using mock mode');
    }
    
    // Start background jobs
    startReminderJob();
    startCleanupJob();
    
    // Start server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📋 API available at http://localhost:${PORT}/api`);
      logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`
🛑 Received ${signal}. Starting graceful shutdown...
`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('✅ HTTP server closed');
    });
  }
  
  // Stop background jobs
  // Note: The jobs are managed by node-cron and will stop when process exits
  logger.info('✅ Background jobs will stop');
  
  // Close database connection
  try {
    await disconnectDatabase();
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
  
  logger.info('👋 Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
