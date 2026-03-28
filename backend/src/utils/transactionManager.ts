import mongoose, { ClientSession, Mongoose } from 'mongoose';
import { logger } from './logger';

/**
 * Transaction Manager
 * 
 * Provides transaction support for multi-step database operations.
 * Automatically handles session management, retries, and rollback on failure.
 */

export interface TransactionOptions {
  /** Maximum number of retry attempts for transient errors */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  /** Transaction timeout in milliseconds */
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * Execute a function within a MongoDB transaction
 * Automatically retries on transient failures and rolls back on any error
 * 
 * @param operation - The async function to execute within the transaction
 * @param options - Transaction configuration options
 * @returns The result of the operation
 * @throws Error if transaction fails after all retries
 */
export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    const session = await mongoose.startSession();
    
    try {
      let result: T | undefined;
      
      await session.withTransaction(async () => {
        result = await operation(session);
      }, {
        maxTimeMS: opts.timeout,
      });

      if (result === undefined) {
        throw new Error('Transaction completed but no result was returned');
      }

      await session.endSession();
      logger.debug(`Transaction completed successfully on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      
      // Always abort the transaction on error
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.warn('Failed to abort transaction:', abortError);
      }
      
      await session.endSession();
      
      // Check if error is retryable
      const isRetryable = isTransientError(error);
      
      if (isRetryable && attempt < opts.maxRetries) {
        logger.warn(
          `Transaction failed (attempt ${attempt}/${opts.maxRetries}), ` +
          `retrying in ${opts.retryDelay}ms: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        await sleep(opts.retryDelay);
      } else {
        logger.error(
          `Transaction failed after ${attempt} attempt(s): ` +
          `${error instanceof Error ? error.message : 'Unknown error'}`
        );
        throw error;
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Transaction failed unexpectedly');
}

/**
 * Check if an error is transient and worth retrying
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    // MongoDB transient error codes
    const transientMessages = [
      'transaction',
      'TransientTransactionError',
      'NetworkTimeout',
      'SocketException',
      'maxTimeMS',
      'lock',
    ];
    
    // Check for known transient error patterns
    for (const pattern of transientMessages) {
      if (error.message.includes(pattern)) {
        return true;
      }
    }
    
    // Check for MongoDB error codes
    if (error.name === 'MongoServerError') {
      const mongoError = error as any;
      // Error code 263 = Transaction aborted
      // Error code 264 = NoSuchTransaction
      // Error code 246 = Transaction sequence error
      const transientCodes = [263, 264, 246];
      if (transientCodes.includes(mongoError.code)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Sleep for the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if MongoDB replica set is available (required for transactions)
 */
export function isTransactionSupported(): boolean {
  const mongo = mongoose.connection as unknown as { db?: { serverConfig?: { topology?: { description?: { type?: string } } } } };
  
  if (!mongo.db?.serverConfig?.topology?.description?.type) {
    return false;
  }
  
  const topologyType = mongo.db.serverConfig.topology.description.type;
  return topologyType === 'ReplicaSet' || topologyType === 'ShardedReplicaSet';
}

/**
 * Get transaction status information
 */
export function getTransactionStatus(): {
  supported: boolean;
  topologyType: string | null;
  isConnected: boolean;
} {
  let topologyType: string | null = null;
  
  try {
    const mongo = mongoose.connection as unknown as { db?: { serverConfig?: { topology?: { description?: { type?: string } } } } };
    topologyType = mongo.db?.serverConfig?.topology?.description?.type || null;
  } catch {
    // Ignore errors when getting topology
  }
  
  return {
    supported: isTransactionSupported(),
    topologyType,
    isConnected: mongoose.connection.readyState === 1,
  };
}

export default {
  withTransaction,
  isTransactionSupported,
  getTransactionStatus,
};
