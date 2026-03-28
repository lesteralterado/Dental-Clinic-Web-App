import apiClient from './client';
import { Appointment, AppointmentFormData } from '../types';

export const appointmentService = {
  async getAll(params?: { date?: string; dentistId?: string; status?: string }): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/appointments', { params });
    return response.data;
  },

  async getToday(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/appointments/today');
    return response.data;
  },

  async getWeek(start?: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/appointments/week', {
      params: { start },
    });
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async create(data: AppointmentFormData): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  },

  async update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async cancel(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  async checkIn(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/checkin`);
    return response.data;
  },
};

export default appointmentService;
