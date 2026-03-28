import { Patient, IPatient } from '../models';
import { AppError, ErrorCode } from '../middleware/error';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { sanitizeSearchQuery, sanitizeString } from '../utils/sanitizer';

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
    
    // SANITIZE: Sanitize string inputs to prevent injection
    const sanitizedData = {
      ...data,
      name: sanitizeString(data.name, 100),
      address: sanitizeString(data.address, 500),
      telephone: sanitizeString(data.telephone, 20),
      occupation: sanitizeString(data.occupation || 'Not specified', 100),
      complaint: sanitizeString(data.complaint, 2000),
      email: data.email ? sanitizeString(data.email, 255) : undefined,
      emergencyContact: data.emergencyContact ? sanitizeString(data.emergencyContact, 100) : undefined,
      emergencyPhone: data.emergencyPhone ? sanitizeString(data.emergencyPhone, 20) : undefined,
      medicalNotes: data.medicalNotes ? sanitizeString(data.medicalNotes, 5000) : undefined,
      allergies: data.allergies ? sanitizeString(data.allergies, 1000) : undefined,
    };
    
    // Normalize gender to lowercase if provided
    const normalizedGender = sanitizedData.gender?.toLowerCase() as 'male' | 'female' | 'other' | undefined;
    
    const patient = await Patient.create({
      ...sanitizedData,
      // Normalize gender to lowercase
      gender: normalizedGender,
      // Provide defaults for missing optional fields
      occupation: sanitizedData.occupation || 'Not specified',
      complaint: sanitizedData.complaint || 'No complaint',
      faceTemplate: sanitizedData.faceTemplate || undefined,
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
      throw new AppError('Patient not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    return patient;
  },

  async findByQrCode(qrCode: string): Promise<IPatient> {
    const patient = await Patient.findOne({ qrCode });
    
    if (!patient) {
      throw new AppError('Patient not found with this QR code', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    return patient;
  },

  async findAll(params: PatientQueryParams): Promise<{ patients: IPatient[]; total: number }> {
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    
    if (search) {
      // SANITIZE: Prevent regex injection by sanitizing search input
      const sanitizedSearch = sanitizeSearchQuery(search);
      
      if (sanitizedSearch) {
        query.$or = [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { telephone: { $regex: sanitizedSearch, $options: 'i' } },
          { email: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }
    }
    
    if (status) {
      // SANITIZE: Only allow valid status values
      const validStatuses = ['new', 'regular', 'archived'];
      if (validStatuses.includes(status)) {
        query.status = status;
      }
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
    // SANITIZE: Sanitize string inputs to prevent injection
    const sanitizedData: UpdatePatientData = {};
    
    if (data.name !== undefined) {
      sanitizedData.name = sanitizeString(data.name, 100);
    }
    if (data.address !== undefined) {
      sanitizedData.address = sanitizeString(data.address, 500);
    }
    if (data.telephone !== undefined) {
      sanitizedData.telephone = sanitizeString(data.telephone, 20);
    }
    if (data.occupation !== undefined) {
      sanitizedData.occupation = sanitizeString(data.occupation, 100);
    }
    if (data.complaint !== undefined) {
      sanitizedData.complaint = sanitizeString(data.complaint, 2000);
    }
    if (data.gender !== undefined) {
      sanitizedData.gender = data.gender.toLowerCase() as 'male' | 'female' | 'other';
    }
    if (data.email !== undefined) {
      sanitizedData.email = data.email ? sanitizeString(data.email, 255) : undefined;
    }
    if (data.emergencyContact !== undefined) {
      sanitizedData.emergencyContact = data.emergencyContact ? sanitizeString(data.emergencyContact, 100) : undefined;
    }
    if (data.emergencyPhone !== undefined) {
      sanitizedData.emergencyPhone = data.emergencyPhone ? sanitizeString(data.emergencyPhone, 20) : undefined;
    }
    if (data.medicalNotes !== undefined) {
      sanitizedData.medicalNotes = data.medicalNotes ? sanitizeString(data.medicalNotes, 5000) : undefined;
    }
    if (data.allergies !== undefined) {
      sanitizedData.allergies = data.allergies ? sanitizeString(data.allergies, 1000) : undefined;
    }
    if (data.status !== undefined) {
      // Only allow valid status values
      const validStatuses = ['new', 'regular', 'archived'];
      if (validStatuses.includes(data.status)) {
        sanitizedData.status = data.status;
      }
    }
    if (data.isFrequent !== undefined) {
      sanitizedData.isFrequent = data.isFrequent;
    }

    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    logger.info(`Patient updated: ${id}`);
    return patient;
  },

  async delete(id: string): Promise<void> {
    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      throw new AppError('Patient not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    logger.info(`Patient deleted: ${id}`);
  },

  async generateQrCode(id: string): Promise<string> {
    const patient = await Patient.findById(id);
    
    if (!patient) {
      throw new AppError('Patient not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
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
