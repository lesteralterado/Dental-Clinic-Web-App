import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

export type AuditAction = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'PAYMENT';

export type AuditResource = 
  | 'patient' 
  | 'appointment' 
  | 'payment' 
  | 'user' 
  | 'notification'
  | 'auth'
  | 'system';

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditContext {
  userId?: string;
  userRole?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  context: AuditContext;
  status: 'success' | 'failure';
  errorMessage?: string;
  alertLevel?: AlertLevel;
}

/**
 * Audit Logger
 * 
 * Specialized logger for tracking all CRUD operations and security-relevant events.
 * Includes correlation IDs, user context, and detailed change tracking.
 */

const auditFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleAuditFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const { action, resource, resourceId, userId, status, ...rest } = meta as any;
    let metaStr = '';
    if (Object.keys(rest).length > 0) {
      metaStr = ' ' + JSON.stringify(rest);
    }
    return `${timestamp} [${level.toUpperCase()}] ${action || 'AUDIT'} ${resource || 'SYSTEM'}: ${message}${metaStr}`;
  })
);

export const auditLogger = winston.createLogger({
  level: 'info',
  format: auditFormat,
  transports: [
    new winston.transports.Console({
      format: consoleAuditFormat,
      level: 'debug',
    }),
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/alerts.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Create an audit log entry
 */
function createAuditEntry(params: {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  context: AuditContext;
  status: 'success' | 'failure';
  errorMessage?: string;
  alertLevel?: AlertLevel;
}): AuditEntry {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...params,
  };
}

/**
 * Log an audit entry
 */
function logAudit(entry: AuditEntry): void {
  const logLevel = entry.status === 'failure' ? 'warn' : 'info';
  
  // Log to audit logger
  auditLogger[logLevel](entry.details, {
    auditId: entry.id,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    userId: entry.context.userId,
    userRole: entry.context.userRole,
    userName: entry.context.userName,
    ipAddress: entry.context.ipAddress,
    requestId: entry.context.requestId,
    status: entry.status,
    ...(entry.changes && { changes: entry.changes }),
    ...(entry.errorMessage && { errorMessage: entry.errorMessage }),
  });

  // If this is marked as an alert, also log to alerts
  if (entry.alertLevel && entry.alertLevel !== 'info') {
    const alertLevel = entry.alertLevel === 'critical' ? 'error' : 
                       entry.alertLevel === 'error' ? 'error' : 'warn';
    auditLogger[alertLevel](`[ALERT:${entry.alertLevel.toUpperCase()}] ${entry.details}`, {
      auditId: entry.id,
      alertLevel: entry.alertLevel,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
    });
  }
}

/**
 * Audit logging helper functions
 */

export const audit = {
  /**
   * Log a create operation
   */
  create(params: {
    resource: AuditResource;
    resourceId: string;
    details: string;
    changes?: Record<string, { before: unknown; after: unknown }>;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      action: 'CREATE',
      ...params,
      status: 'success',
    });
    logAudit(entry);
  },

  /**
   * Log a read operation
   */
  read(params: {
    resource: AuditResource;
    resourceId?: string;
    details: string;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      action: 'READ',
      ...params,
      status: 'success',
    });
    logAudit(entry);
  },

  /**
   * Log an update operation
   */
  update(params: {
    resource: AuditResource;
    resourceId: string;
    details: string;
    changes?: Record<string, { before: unknown; after: unknown }>;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      action: 'UPDATE',
      ...params,
      status: 'success',
    });
    logAudit(entry);
  },

  /**
   * Log a delete operation
   */
  delete(params: {
    resource: AuditResource;
    resourceId: string;
    details: string;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      action: 'DELETE',
      ...params,
      status: 'success',
    });
    logAudit(entry);
  },

  /**
   * Log a successful operation
   */
  success(params: {
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details: string;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      ...params,
      status: 'success',
    });
    logAudit(entry);
  },

  /**
   * Log a failed operation
   */
  failure(params: {
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details: string;
    errorMessage?: string;
    context: AuditContext;
    alertLevel?: AlertLevel;
  }): void {
    const entry = createAuditEntry({
      ...params,
      status: 'failure',
    });
    logAudit(entry);
  },

  /**
   * Log a security alert
   */
  alert(params: {
    level: AlertLevel;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details: string;
    errorMessage?: string;
    context: AuditContext;
  }): void {
    const entry = createAuditEntry({
      ...params,
      status: params.level === 'critical' || params.level === 'error' ? 'failure' : 'success',
      alertLevel: params.level,
    });
    logAudit(entry);
  },

  /**
   * Log a system event
   */
  system(params: {
    details: string;
    context?: AuditContext;
    alertLevel?: AlertLevel;
  }): void {
    const entry = createAuditEntry({
      action: 'READ',
      resource: 'system',
      details: params.details,
      context: params.context || {},
      status: params.alertLevel === 'critical' || params.alertLevel === 'error' ? 'failure' : 'success',
      alertLevel: params.alertLevel,
    });
    logAudit(entry);
  },
};

export default audit;
