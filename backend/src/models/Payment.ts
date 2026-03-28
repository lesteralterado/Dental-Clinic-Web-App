import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  appointmentNo?: string;
  date: Date;
  time: string;
  description: string;
  type: 'cash' | 'card' | 'insurance' | 'other';
  debit: number;
  credit: number;
  balance: number;
  status: 'pending' | 'completed' | 'refunded';
  creditDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentNo: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'other'],
      default: 'cash',
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
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
    creditDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by patient
paymentSchema.index({ patientId: 1, date: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
