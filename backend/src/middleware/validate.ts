import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }
    
    next();
  };
};

// Auth schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin', 'doctor', 'receptionist'),
});

// Patient schemas
export const createPatientSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  telephone: Joi.string().required(),
  age: Joi.number().min(0).max(150).required(),
  occupation: Joi.string().required(),
  complaint: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  dateOfBirth: Joi.date().required(),
  email: Joi.string().email(),
  emergencyContact: Joi.string(),
  emergencyPhone: Joi.string(),
  medicalNotes: Joi.string(),
  allergies: Joi.string(),
});

// Appointment schemas
export const createAppointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  dentistId: Joi.string().required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string().required(),
  duration: Joi.number().min(15).max(180),
  reason: Joi.string().required(),
  notes: Joi.string(),
});

// Treatment schemas
export const createTreatmentSchema = Joi.object({
  patientId: Joi.string().required(),
  dentistId: Joi.string().required(),
  recordDate: Joi.date().required(),
  recordNo: Joi.number().required(),
  description: Joi.string().required(),
  treatmentTime: Joi.string().required(),
  debit: Joi.number().min(0),
  credit: Joi.number().min(0),
});

// Payment schemas
export const createPaymentSchema = Joi.object({
  patientId: Joi.string().required(),
  appointmentNo: Joi.string(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('cash', 'card', 'insurance', 'other'),
  debit: Joi.number().min(0),
  credit: Joi.number().min(0),
  balance: Joi.number().min(0),
  status: Joi.string().valid('pending', 'completed', 'refunded'),
  creditDate: Joi.date(),
});

// Notification schemas
export const registerTokenSchema = Joi.object({
  fcmToken: Joi.string().required(),
});

export default { validate };
