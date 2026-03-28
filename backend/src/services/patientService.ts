import { Patient, IPatient } from '../models';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export interface CreatePatientData {
  name: string;
  address: string;
  telephone: string;
  age: number;
  occupation?: string;
  complaint?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  allergies?: string;
  faceTemplate?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  status?: 'new' | 'regular' | 'archived';
  isFrequent?: boolean;
}

export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const patientService = {
  async create(data: CreatePatientData): Promise<IPatient> {
    // Generate unique QR code
    const qrCodeId = `DENTAL-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Normalize gender to lowercase if provided
    const normalizedGender = data.gender?.toLowerCase() as 'male' | 'female' | 'other' | undefined;
    
    const patient = await Patient.create({
      ...data,
      // Normalize gender to lowercase
      gender: normalizedGender,
      // Provide defaults for missing optional fields
      occupation: data.occupation || 'Not specified',
      complaint: data.complaint || 'No complaint',
      faceTemplate: data.faceTemplate || undefined,
      qrCode: qrCodeId,
      status: 'new',
      isFrequent: false,
    });

    logger.info(`Patient created: ${patient._id}`);
    return patient;
  },

  async findById(id: string): Promise<IPatient> {
    const patient = await Patient.findById(id);
    
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  },

  async findByQrCode(qrCode: string): Promise<IPatient> {
    const patient = await Patient.findOne({ qrCode });
    
    if (!patient) {
      throw new AppError('Patient not found with this QR code', 404);
    }

    return patient;
  },

  async findAll(params: PatientQueryParams): Promise<{ patients: IPatient[]; total: number }> {
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(query);

    return { patients, total };
  },

  async getRecent(limit: number = 10): Promise<IPatient[]> {
    return Patient.find({ lastVisit: { $exists: true } })
      .sort({ lastVisit: -1 })
      .limit(limit);
  },

  async getFrequent(): Promise<IPatient[]> {
    return Patient.find({ isFrequent: true }).sort({ lastVisit: -1 });
  },

  async update(id: string, data: UpdatePatientData): Promise<IPatient> {
    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    logger.info(`Patient updated: ${id}`);
    return patient;
  },

  async delete(id: string): Promise<void> {
    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    logger.info(`Patient deleted: ${id}`);
  },

  async generateQrCode(id: string): Promise<string> {
    const patient = await Patient.findById(id);
    
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    if (!patient.qrCode) {
      patient.qrCode = `DENTAL-${uuidv4().substring(0, 8).toUpperCase()}`;
      await patient.save();
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(patient.qrCode);
    return qrCodeDataUrl;
  },

  async updateLastVisit(id: string): Promise<void> {
    await Patient.findByIdAndUpdate(id, { lastVisit: new Date() });
  },
};

export default patientService;
