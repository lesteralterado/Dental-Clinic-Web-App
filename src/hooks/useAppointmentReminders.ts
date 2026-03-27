'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationPreferences } from '@/lib/services/notification';

interface Appointment {
  id: string;
  patientId: string;
  patient?: {
    name: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  isCheckedIn: boolean;
  status: string;
}

// Check appointments every minute and trigger reminders
export function useAppointmentReminders(appointments: Appointment[]) {
  const { triggerNotification } = useNotifications();
  const notifiedAppointments = useRef<Set<string>>(new Set());
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  const checkReminders = useCallback(() => {
    const preferences = getNotificationPreferences();
    
    if (!preferences.enabled || !preferences.reminders) {
      return;
    }

    const now = new Date();
    const reminderMinutes = preferences.reminderMinutes;

    appointments.forEach(appointment => {
      // Skip if already checked in or already notified
      if (appointment.isCheckedIn || notifiedAppointments.current.has(appointment.id)) {
        return;
      }

      // Skip if not scheduled status
      if (appointment.status !== 'SCHEDULED') {
        return;
      }

      // Parse appointment time
      const appointmentDateTime = new Date(
        `${appointment.appointmentDate}T${appointment.appointmentTime}`
      );
      
      // Calculate minutes until appointment
      const minutesUntil = Math.floor(
        (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60)
      );

      // Trigger reminder if within the reminder window
      if (minutesUntil > 0 && minutesUntil <= reminderMinutes) {
        const patientName = appointment.patient?.name || 'Patient';
        triggerNotification(
          'reminder',
          patientName,
          `${minutesUntil} minutes`
        );
        notifiedAppointments.current.add(appointment.id);
      }
    });
  }, [appointments, triggerNotification]);

  useEffect(() => {
    // Check immediately on mount
    checkReminders();

    // Set up interval to check every minute
    checkInterval.current = setInterval(checkReminders, 60000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [checkReminders]);

  // Reset notified appointments when date changes (new day)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === today);
    
    // If no appointments for today, clear the notified set
    if (todayAppointments.length === 0) {
      notifiedAppointments.current.clear();
    }
  }, [appointments]);

  return {
    resetNotifiedAppointments: () => {
      notifiedAppointments.current.clear();
    },
  };
}

export default useAppointmentReminders;