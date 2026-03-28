import apiClient from './client';
import { Patient, PatientFormData, PatientsResponse, QRCodeResponse, FaceMatchResult } from '../types';

// Patient service that uses the real API endpoints
export const patientService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PatientsResponse> {
    const response = await apiClient.get<PatientsResponse>('/patients', { params });
    return response.data;
  },

  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patients/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getRecent(): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patients/recent');
    return response.data;
  },

  async getFrequent(): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patients/frequent');
    return response.data;
  },

  async create(data: PatientFormData): Promise<Patient> {
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  async update(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    const response = await apiClient.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },

  async getQRCode(id: string): Promise<QRCodeResponse> {
    const response = await apiClient.get<QRCodeResponse>(`/patients/${id}/qr`);
    return response.data;
  },

  async sendQREmail(id: string, email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/patients/${id}/send-qr-email`, { email });
    return response.data;
  },

  async identifyByFace(faceTemplate: string): Promise<FaceMatchResult> {
    const response = await apiClient.post<FaceMatchResult>('/patients/identify/face', {
      faceTemplate,
    });
    return response.data;
  },
};

export default patientService;