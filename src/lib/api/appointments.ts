import apiClient from './client';
import { Appointment, AppointmentFormData } from '../types';
import { mockAppointmentService } from '@/lib/mock/appointments';

// Check if we're in demo mode
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};

export const appointmentService = {
  async getAll(params?: { date?: string; dentistId?: string; status?: string }): Promise<Appointment[]> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.getAll(params);
      } catch (error) {
        console.error('Demo mode getAll error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Appointment[]>('/appointments', { params });
    return response.data;
  },

  async getToday(): Promise<Appointment[]> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.getToday();
      } catch (error) {
        console.error('Demo mode getToday error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Appointment[]>('/appointments/today');
    return response.data;
  },

  async getWeek(start?: string): Promise<Appointment[]> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.getWeek(start);
      } catch (error) {
        console.error('Demo mode getWeek error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Appointment[]>('/appointments/week', {
      params: { start },
    });
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.getById(id);
      } catch (error) {
        console.error('Demo mode getById error:', error);
        throw new Error('Appointment not found');
      }
    }
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async create(data: AppointmentFormData): Promise<Appointment> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.create(data);
      } catch (error) {
        console.error('Demo mode create error:', error);
        throw new Error('Failed to create appointment in demo mode');
      }
    }
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  },

  async update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.update(id, data);
      } catch (error) {
        console.error('Demo mode update error:', error);
        throw new Error('Failed to update appointment in demo mode');
      }
    }
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async cancel(id: string): Promise<void> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.cancel(id);
      } catch (error) {
        console.error('Demo mode cancel error:', error);
        throw new Error('Failed to cancel appointment in demo mode');
      }
    }
    await apiClient.delete(`/appointments/${id}`);
  },

  async checkIn(id: string): Promise<Appointment> {
    if (isDemoMode()) {
      try {
        return await mockAppointmentService.checkIn(id);
      } catch (error) {
        console.error('Demo mode checkIn error:', error);
        throw new Error('Failed to check in appointment in demo mode');
      }
    }
    const response = await apiClient.post<Appointment>(`/appointments/${id}/checkin`);
    return response.data;
  },
};

export default appointmentService;
