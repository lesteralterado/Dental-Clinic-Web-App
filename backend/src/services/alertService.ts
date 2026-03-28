import { logger } from '../utils/logger';
import { audit, AlertLevel } from '../utils/auditLogger';
import * as os from 'os';
import mongoose from 'mongoose';

// Alert configuration
interface AlertConfig {
  enabled: boolean;
  memoryThreshold: number;      // percentage
  errorThreshold: number;       // errors per minute
  checkInterval: number;        // milliseconds
  emailEnabled: boolean;
  emailRecipients: string[];
  slackWebhookUrl: string | null;
}

const DEFAULT_CONFIG: AlertConfig = {
  enabled: process.env.ALERT_ENABLED === 'true',
  memoryThreshold: parseInt(process.env.ALERT_MEMORY_THRESHOLD || '80', 10),
  errorThreshold: parseInt(process.env.ALERT_ERROR_THRESHOLD || '10', 10),
  checkInterval: parseInt(process.env.ALERT_CHECK_INTERVAL || '300000', 10), // 5 minutes
  emailEnabled: process.env.ALERT_EMAIL_ENABLED === 'true',
  emailRecipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
  slackWebhookUrl: process.env.ALERT_SLACK_WEBHOOK_URL || null,
};

// Error tracking for rate limiting
interface ErrorTracker {
  count: number;
  windowStart: number;
}

class AlertService {
  private config: AlertConfig;
  private errorTracker: ErrorTracker = { count: 0, windowStart: Date.now() };
  private checkInterval: NodeJS.Timeout | null = null;
  private lastHealthStatus: HealthStatus | null = null;

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the alert monitoring service
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info('Alert service is disabled');
      return;
    }

    logger.info(`Starting alert service (check every ${this.config.checkInterval / 1000}s)`);

    // Perform initial check
    this.checkHealth();

    // Schedule periodic health checks
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, this.config.checkInterval);
  }

  /**
   * Stop the alert monitoring service
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Alert service stopped');
    }
  }

  /**
   * Check system health and trigger alerts if needed
   */
  async checkHealth(): Promise<HealthStatus> {
    const status = this.getHealthStatus();
    this.lastHealthStatus = status;

    // Check memory usage
    if (status.memory.usedPercent >= this.config.memoryThreshold) {
      const level = status.memory.usedPercent >= 90 ? 'critical' : 'warning';
      await this.sendAlert({
        level,
        title: `Memory Usage ${level === 'critical' ? 'Critical' : 'High'}`,
        message: `Memory usage is at ${status.memory.usedPercent.toFixed(1)}%`,
        category: 'system',
      });
    }

    // Check database connection
    if (!status.database.connected) {
      await this.sendAlert({
        level: 'critical',
        title: 'Database Disconnected',
        message: 'MongoDB connection has been lost',
        category: 'database',
      });
    }

    // Check error rate
    this.cleanupErrorTracker();
    if (this.errorTracker.count >= this.config.errorThreshold) {
      await this.sendAlert({
        level: 'error',
        title: 'High Error Rate',
        message: `${this.errorTracker.count} errors in the last minute`,
        category: 'errors',
      });
    }

    return status;
  }

  /**
   * Track an error for rate limiting
   */
  trackError(): void {
    this.errorTracker.count++;
    this.cleanupErrorTracker();
  }

  /**
   * Get current health status
   */
  private getHealthStatus(): HealthStatus {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      timestamp: new Date().toISOString(),
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usedPercent: (usedMem / totalMem) * 100,
      },
      cpu: {
        loadAverage: os.loadavg(),
        count: os.cpus().length,
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
      },
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  }

  /**
   * Clean up error tracker every minute
   */
  private cleanupErrorTracker(): void {
    const now = Date.now();
    const windowSize = 60000; // 1 minute

    if (now - this.errorTracker.windowStart > windowSize) {
      this.errorTracker = { count: 0, windowStart: now };
    }
  }

  /**
   * Send an alert through configured channels
   */
  async sendAlert(params: {
    level: AlertLevel;
    title: string;
    message: string;
    category: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    const { level, title, message, category, details } = params;

    // Log the alert
    logger[level === 'critical' || level === 'error' ? 'error' : 'warn'](
      `[ALERT:${level.toUpperCase()}] ${title}: ${message}`
    );

    // Log to audit
    audit.alert({
      level,
      action: 'READ',
      resource: 'system',
      details: `${title} - ${message}`,
      context: {},
    });

    // Send to email if enabled
    if (this.config.emailEnabled) {
      try {
        await this.sendEmailAlert(params);
      } catch (error) {
        logger.error('Failed to send email alert:', error);
      }
    }

    // Send to Slack if configured
    if (this.config.slackWebhookUrl) {
      try {
        await this.sendSlackAlert(params);
      } catch (error) {
        logger.error('Failed to send Slack alert:', error);
      }
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(params: {
    level: AlertLevel;
    title: string;
    message: string;
    category: string;
  }): Promise<void> {
    // Note: This requires nodemailer to be configured
    // For now, we'll just log the email that would be sent
    logger.info(`[EMAIL ALERT] To: ${this.config.emailRecipients.join(', ')}`);
    logger.info(`[EMAIL ALERT] Subject: [${params.level.toUpperCase()}] ${params.title}`);
    logger.info(`[EMAIL ALERT] Body: ${params.message}`);
  }

  /**
   * Send Slack webhook alert
   */
  private async sendSlackAlert(params: {
    level: AlertLevel;
    title: string;
    message: string;
    category: string;
  }): Promise<void> {
    const colorMap: Record<AlertLevel, string> = {
      info: '#36a64f',
      warning: '#ff9800',
      error: '#f44336',
      critical: '#b71c1c',
    };

    const payload = {
      attachments: [{
        color: colorMap[params.level],
        title: params.title,
        text: params.message,
        footer: 'Dental Clinic Alert System',
        ts: Math.floor(Date.now() / 1000),
      }],
    };

    logger.info(`[SLACK ALERT] Would send: ${JSON.stringify(payload)}`);
  }

  /**
   * Get last health status
   */
  getLastHealthStatus(): HealthStatus | null {
    return this.lastHealthStatus;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Alert configuration updated');
  }
}

export interface HealthStatus {
  timestamp: string;
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercent: number;
  };
  cpu: {
    loadAverage: number[];
    count: number;
  };
  database: {
    connected: boolean;
    readyState: number;
  };
  process: {
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
  };
}

// Export singleton instance
export const alertService = new AlertService();

export default alertService;
