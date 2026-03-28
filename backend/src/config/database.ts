import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
  
  // Connection options for production
  const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Try to find a server within 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4 (skip IPv6 resolution)
    retryWrites: true, // Retry failed writes
    retryReads: true, // Retry failed reads
  };
  
  try {
    await mongoose.connect(mongoUri, options);
    logger.info('✅ Connected to MongoDB successfully');
    
    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    mongoose.connection.on('close', () => {
      logger.info('MongoDB connection closed');
    });
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    // In production, we might want to retry instead of exiting
    if (process.env.NODE_ENV === 'production') {
      logger.error('Retrying connection in 5 seconds...');
      setTimeout(() => connectDatabase(), 5000);
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

export default mongoose;
