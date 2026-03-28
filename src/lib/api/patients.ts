import apiClient from './client';
import { Patient, PatientFormData, PatientsResponse, QRCodeResponse, FaceMatchResult } from '../types';
import { mockPatientService } from '@/lib/mock/patients';

// Check if we're in demo mode
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};

// Patient service that falls back to mock data in demo mode
export const patientService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PatientsResponse> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.getAll(params);
      } catch (error) {
        console.error('Demo mode getAll error:', error);
        return { patients: [], total: 0, page: 1, totalPages: 0 };
      }
    }
    const response = await apiClient.get<PatientsResponse>('/patients', { params });
    return response.data;
  },

  async getById(id: string): Promise<Patient> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.getById(id);
      } catch (error) {
        console.error('Demo mode getById error:', error);
        throw new Error('Patient not found');
      }
    }
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Patient[]> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.search(query);
      } catch (error) {
        console.error('Demo mode search error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Patient[]>('/patients/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getRecent(): Promise<Patient[]> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.getRecent();
      } catch (error) {
        console.error('Demo mode getRecent error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Patient[]>('/patients/recent');
    return response.data;
  },

  async getFrequent(): Promise<Patient[]> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.getFrequent();
      } catch (error) {
        console.error('Demo mode getFrequent error:', error);
        return [];
      }
    }
    const response = await apiClient.get<Patient[]>('/patients/frequent');
    return response.data;
  },

  async create(data: PatientFormData): Promise<Patient> {
    if (isDemoMode()) {
      // Convert Date to string for mock service
      const mockData = {
        ...data,
        dateOfBirth: data.dateOfBirth instanceof Date 
          ? data.dateOfBirth.toISOString().split('T')[0] 
          : data.dateOfBirth,
      };
      try {
        return await mockPatientService.create(mockData as Partial<Patient>);
      } catch (error) {
        console.error('Demo mode create error:', error);
        throw new Error('Failed to create patient in demo mode');
      }
    }
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  async update(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    if (isDemoMode()) {
      // Convert Date to string for mock service
      const mockData = data.dateOfBirth ? {
        ...data,
        dateOfBirth: data.dateOfBirth instanceof Date 
          ? data.dateOfBirth.toISOString().split('T')[0] 
          : data.dateOfBirth,
      } : data;
      try {
        return await mockPatientService.update(id, mockData as Partial<Patient>);
      } catch (error) {
        console.error('Demo mode update error:', error);
        throw new Error('Failed to update patient in demo mode');
      }
    }
    const response = await apiClient.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.delete(id);
      } catch (error) {
        console.error('Demo mode delete error:', error);
        throw new Error('Failed to delete patient in demo mode');
      }
    }
    await apiClient.delete(`/patients/${id}`);
  },

  async getQRCode(id: string): Promise<QRCodeResponse> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.getQRCode(id);
      } catch (error) {
        console.error('Demo mode getQRCode error:', error);
        throw new Error('Failed to get QR code in demo mode');
      }
    }
    const response = await apiClient.get<QRCodeResponse>(`/patients/${id}/qr`);
    return response.data;
  },

  async sendQREmail(id: string, email: string): Promise<{ success: boolean; message: string }> {
    if (isDemoMode()) {
      try {
        await mockPatientService.sendQREmail(id, email);
        return { success: true, message: 'QR code email sent successfully (demo mode)' };
      } catch (error) {
        console.error('Demo mode sendQREmail error:', error);
        return { success: false, message: 'Failed to send QR email in demo mode' };
      }
    }
    const response = await apiClient.post(`/patients/${id}/send-qr-email`, { email });
    return response.data;
  },

  async identifyByFace(faceTemplate: string): Promise<FaceMatchResult> {
    if (isDemoMode()) {
      try {
        return await mockPatientService.identifyByFace(faceTemplate);
      } catch (error) {
        console.error('Demo mode identifyByFace error:', error);
        throw new Error('Failed to identify face in demo mode');
      }
    }
    const response = await apiClient.post<FaceMatchResult>('/patients/identify/face', {
      faceTemplate,
    });
    return response.data;
  },
};

export default patientService;