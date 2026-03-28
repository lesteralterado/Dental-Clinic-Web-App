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
  email: Joi.string().email().max(255).required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(), // bcrypt max is 72
  name: Joi.string().min(2).max(100).trim().required(),
  role: Joi.string().valid('admin', 'doctor', 'receptionist').required(),
});

// Password reset schemas
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(255).required()
    .messages({ 'string.email': 'Please provide a valid email address' }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().min(64).max(64).required()
    .messages({ 'string.min': 'Invalid reset token', 'string.max': 'Invalid reset token' }),
  newPassword: Joi.string()
    .min(8)
    .max(72) // bcrypt max
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be less than 72 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, lowercase letter, number, and special character (@$!%*?&)',
    }),
});

// Patient schemas - ENHANCED with stricter validation
export const createPatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required()
    .pattern(/^[a-zA-Z\s\-\.']+$/)
    .messages({ 'string.pattern.base': "Name can only contain letters, spaces, hyphens, periods, and apostrophes" }),
  address: Joi.string().min(5).max(500).trim().required()
    .pattern(/^[a-zA-Z0-9\s\-\.,#]+$/)
    .messages({ 'string.pattern.base': 'Invalid address format' }),
  telephone: Joi.string().min(7).max(20).required()
    .pattern(/^[0-9\+\-\s\(\)]+$/)
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),
  age: Joi.number().min(0).max(150).required(),
  occupation: Joi.string().min(2).max(100).trim().default('Not specified'),
  complaint: Joi.string().min(3).max(2000).trim().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  dateOfBirth: Joi.date().required(),
  email: Joi.string().email().max(255).allow('', null),
  emergencyContact: Joi.string().max(100).allow('', null),
  emergencyPhone: Joi.string().max(20).allow('', null)
    .pattern(/^[0-9\+\-\s\(\)]*$/)
    .messages({ 'string.pattern.base': 'Invalid emergency phone format' }),
  medicalNotes: Joi.string().max(5000).trim().allow('', null),
  allergies: Joi.string().max(1000).trim().allow('', null),
});

// Update patient schema - allows partial updates
export const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim()
    .pattern(/^[a-zA-Z\s\-\.]+$/)
    .messages({ 'string.pattern.base': "Name can only contain letters, spaces, hyphens, periods, and apostrophes" }),
  address: Joi.string().min(5).max(500).trim()
    .pattern(/^[a-zA-Z0-9\s\-\.,#]+$/)
    .messages({ 'string.pattern.base': 'Invalid address format' }),
  telephone: Joi.string().min(7).max(20)
    .pattern(/^[0-9\+\-\s\(\)]+$/)
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),
  age: Joi.number().min(0).max(150),
  occupation: Joi.string().min(2).max(100).trim(),
  complaint: Joi.string().min(3).max(2000).trim(),
  gender: Joi.string().valid('male', 'female', 'other'),
  dateOfBirth: Joi.date(),
  email: Joi.string().email().max(255).allow('', null),
  emergencyContact: Joi.string().max(100).allow('', null),
  emergencyPhone: Joi.string().max(20).allow('', null)
    .pattern(/^[0-9\+\-\s\(\)]*$/)
    .messages({ 'string.pattern.base': 'Invalid emergency phone format' }),
  medicalNotes: Joi.string().max(5000).trim().allow('', null),
  allergies: Joi.string().max(1000).trim().allow('', null),
  status: Joi.string().valid('new', 'regular', 'archived'),
});

// Appointment schemas - ENHANCED
export const createAppointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  dentistId: Joi.string().required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string().required()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({ 'string.pattern.base': 'Time must be in HH:MM format' }),
  duration: Joi.number().min(15).max(180).default(30),
  reason: Joi.string().min(3).max(500).trim().required(),
  notes: Joi.string().max(2000).trim().allow('', null),
});

// Update appointment schema
export const updateAppointmentSchema = Joi.object({
  patientId: Joi.string(),
  dentistId: Joi.string(),
  appointmentDate: Joi.date(),
  appointmentTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({ 'string.pattern.base': 'Time must be in HH:MM format' }),
  duration: Joi.number().min(15).max(180),
  reason: Joi.string().min(3).max(500).trim(),
  notes: Joi.string().max(2000).trim().allow('', null),
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'),
});

// Treatment schemas
export const createTreatmentSchema = Joi.object({
  patientId: Joi.string().required(),
  dentistId: Joi.string().required(),
  recordDate: Joi.date().required(),
  recordNo: Joi.number().required(),
  description: Joi.string().min(3).max(1000).required(),
  treatmentTime: Joi.string().required(),
  debit: Joi.number().min(0).default(0),
  credit: Joi.number().min(0).default(0),
});

// Payment schemas
export const createPaymentSchema = Joi.object({
  patientId: Joi.string().required(),
  appointmentNo: Joi.string().allow('', null),
  date: Joi.date().required(),
  time: Joi.string().required(),
  description: Joi.string().min(3).max(500).required(),
  type: Joi.string().valid('cash', 'card', 'insurance', 'other').default('cash'),
  debit: Joi.number().min(0).default(0),
  credit: Joi.number().min(0).default(0),
  balance: Joi.number().min(0),
  status: Joi.string().valid('pending', 'completed', 'refunded').default('pending'),
  creditDate: Joi.date().allow('', null),
});

// Notification schemas
export const registerTokenSchema = Joi.object({
  fcmToken: Joi.string().required(),
});

// Query parameter schemas for validation
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});

export const patientQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().max(100).allow('', null),
  status: Joi.string().valid('new', 'regular', 'archived').allow('', null),
});

export const appointmentQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  patientId: Joi.string().allow('', null),
  dentistId: Joi.string().allow('', null),
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show').allow('', null),
  date: Joi.date().allow('', null),
});

export default { validate, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, createPatientSchema, updatePatientSchema, createAppointmentSchema, updateAppointmentSchema, createTreatmentSchema, createPaymentSchema, registerTokenSchema, paginationSchema, patientQuerySchema, appointmentQuerySchema };
