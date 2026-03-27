import { Patient, PatientsResponse } from '@/lib/types';
import { mockPatients } from './data';

// Mock Patient Service - mirrors the API service interface
export const mockPatientService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PatientsResponse> {
    let filtered = [...mockPatients];

    // Search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.telephone.includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      patients: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },

  async getById(id: string): Promise<Patient> {
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  },

  async search(query: string): Promise<Patient[]> {
    const searchLower = query.toLowerCase();
    return mockPatients.filter(
      p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.telephone.includes(query) ||
        p.email?.toLowerCase().includes(searchLower)
    );
  },

  async getRecent(): Promise<Patient[]> {
    // Return patients sorted by last visit (most recent first)
    return [...mockPatients].sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });
  },

  async getFrequent(): Promise<Patient[]> {
    // Return frequent patients (isFrequent = true)
    return mockPatients.filter(p => p.isFrequent);
  },

  async create(data: Partial<Patient>): Promise<Patient> {
    const newPatient: Patient = {
      id: `p${Date.now()}`,
      qrCode: `QR-P${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Patient;
    mockPatients.push(newPatient);
    return newPatient;
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }
    mockPatients[index] = {
      ...mockPatients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockPatients[index];
  },

  async delete(id: string): Promise<void> {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }
    mockPatients.splice(index, 1);
  },

  async getQRCode(id: string): Promise<{ qrCode: string; qrCodeData: string }> {
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return {
      qrCode: patient.qrCode,
      qrCodeData: `DEMO-QR-${patient.id}`,
    };
  },

  async identifyByFace(_faceTemplate: string): Promise<{ patient: Patient; similarity: number }> {
    // For demo, return the first patient with high similarity
    return {
      patient: mockPatients[0],
      similarity: 0.95,
    };
  },

  async sendQREmail(_id: string, _email: string): Promise<void> {
    // For demo, simulate sending email
    console.log('QR Email sent (demo mode)');
  },
};

export default mockPatientService;