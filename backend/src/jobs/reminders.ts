import cron from 'node-cron';
import { logger } from '../utils/logger';
import appointmentService from '../services/appointmentService';

export const startReminderJob = (): void => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running appointment reminder check...');
    
    try {
      const upcomingAppointments = await appointmentService.getUpcomingReminders();
      
      if (upcomingAppointments.length === 0) {
        logger.info('No upcoming appointments for reminders');
        return;
      }

      logger.info(`Found ${upcomingAppointments.length} appointments needing reminders`);

      for (const appointment of upcomingAppointments) {
        try {
          // Get patient and dentist info from populated fields
          const patientName = (appointment as any).patientId?.name || 'Patient';
          const dentistName = (appointment as any).dentistId?.name || 'Dentist';
          
          logger.info(`Sending reminder for appointment ${appointment._id} - ${patientName} at ${appointment.appointmentTime}`);
          
          // Mark reminder as sent
          await appointmentService.markReminderSent(appointment._id.toString());
        } catch (error) {
          logger.error(`Error sending reminder for appointment ${appointment._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in reminder job:', error);
    }
  });

  logger.info('Appointment reminder job started');
};

export const startCleanupJob = (): void => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running cleanup job...');
    
    try {
      const deletedCount = await notificationService.deleteOldNotifications(30);
      logger.info(`Cleaned up ${deletedCount} old notifications`);
    } catch (error) {
      logger.error('Error in cleanup job:', error);
    }
  });

  logger.info('Cleanup job started');
};

import notificationService from '../services/notificationService';

export default { startReminderJob, startCleanupJob };
