import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  qrCode: string;
  faceData?: string;
  faceTemplate?: string;
  name: string;
  address: string;
  telephone: string;
  age: number;
  occupation: string;
  status: 'new' | 'regular' | 'archived';
  complaint: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  email?: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes?: string;
  allergies?: string;
  isFrequent: boolean;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    faceData: {
      type: String,
    },
    faceTemplate: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    occupation: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'regular', 'archived'],
      default: 'new',
    },
    complaint: {
      type: String,
      required: false,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    emergencyPhone: {
      type: String,
      trim: true,
    },
    medicalNotes: {
      type: String,
    },
    allergies: {
      type: String,
    },
    isFrequent: {
      type: Boolean,
      default: false,
    },
    lastVisit: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
patientSchema.index({ name: 'text', telephone: 'text', email: 'text' });

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);

export default Patient;
