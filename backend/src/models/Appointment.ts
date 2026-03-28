import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  dentistId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
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
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
      min: 15,
      max: 180,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double booking
appointmentSchema.index(
  { dentistId: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true }
);

// Index for querying
appointmentSchema.index({ appointmentDate: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
