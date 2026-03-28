import mongoose, { Document, Schema } from 'mongoose';

export interface ITreatment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  dentistId: mongoose.Types.ObjectId;
  recordDate: Date;
  recordNo: number;
  description: string;
  treatmentTime: string;
  debit: number;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}

const treatmentSchema = new Schema<ITreatment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    dentistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordDate: {
      type: Date,
      required: true,
    },
    recordNo: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    treatmentTime: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
      min: 0,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique record number per patient
treatmentSchema.index({ patientId: 1, recordNo: 1 }, { unique: true });

// Index for patient's treatment history
treatmentSchema.index({ patientId: 1, recordDate: -1 });

// Index for dentist's treatment records
treatmentSchema.index({ dentistId: 1, recordDate: -1 });

// Index for date range queries
treatmentSchema.index({ recordDate: -1 });

export const Treatment = mongoose.model<ITreatment>('Treatment', treatmentSchema);

export default Treatment;
