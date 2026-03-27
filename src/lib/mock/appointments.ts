import { Appointment, AppointmentFormData } from '@/lib/types';
import { mockAppointments } from './data';

// Mock Appointment Service - mirrors the API service interface
export const mockAppointmentService = {
  async getAll(params?: { date?: string; dentistId?: string; status?: string }): Promise<Appointment[]> {
    let filtered = [...mockAppointments];

    if (params?.date) {
      filtered = filtered.filter(a => a.appointmentDate === params.date);
    }

    if (params?.dentistId) {
      filtered = filtered.filter(a => a.dentistId === params.dentistId);
    }

    if (params?.status) {
      filtered = filtered.filter(a => a.status === params.status);
    }

    // Sort by time
    return filtered.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  },

  async getToday(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return mockAppointments
      .filter(a => a.appointmentDate === today)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  },

  async getWeek(start?: string): Promise<Appointment[]> {
    const startDate = start ? new Date(start) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return mockAppointments.filter(a => {
      const appointmentDate = new Date(a.appointmentDate);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  },

  async getById(id: string): Promise<Appointment> {
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  },

  async create(data: AppointmentFormData): Promise<Appointment> {
    const newAppointment: Appointment = {
      id: `a${Date.now()}`,
      ...data,
      duration: data.duration || 30,
      status: 'SCHEDULED',
      isCheckedIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  async update(id: string, data: Partial<AppointmentFormData>): Promise<Appointment> {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    mockAppointments[index] = {
      ...mockAppointments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockAppointments[index];
  },

  async cancel(id: string): Promise<void> {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    mockAppointments[index].status = 'CANCELLED';
    mockAppointments[index].updatedAt = new Date().toISOString();
  },

  async checkIn(id: string): Promise<Appointment> {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    mockAppointments[index].isCheckedIn = true;
    mockAppointments[index].checkedInAt = new Date().toISOString();
    mockAppointments[index].status = 'CONFIRMED';
    mockAppointments[index].updatedAt = new Date().toISOString();
    return mockAppointments[index];
  },
};

export default mockAppointmentService;