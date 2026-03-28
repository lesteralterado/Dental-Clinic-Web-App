import apiClient from './client';
import { mockDashboardStats, mockPatients, mockAppointments } from '@/lib/mock/data';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedToday: number;
}

// Check if we're in demo mode
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (isDemoMode()) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = mockAppointments.filter(
          a => a.appointmentDate === today
        );
        
        return {
          totalPatients: mockPatients.length,
          todayAppointments: todayAppointments.length,
          pendingAppointments: todayAppointments.filter(a => a.status === 'SCHEDULED').length,
          completedToday: todayAppointments.filter(a => a.status === 'COMPLETED').length,
        };
      } catch (error) {
        console.error('Demo mode getStats error:', error);
        return {
          totalPatients: 0,
          todayAppointments: 0,
          pendingAppointments: 0,
          completedToday: 0,
        };
      }
    }
    
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
