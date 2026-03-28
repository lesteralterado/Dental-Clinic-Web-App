// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Patient types
export interface Patient {
  id: string;
  qrCode: string;
  faceData?: string | null;
  faceTemplate?: string | null;
  name: string;
  address: string;
  telephone: string;
  age: number;
  occupation?: string;
  status?: string;
  complaint?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  allergies?: string;
  isFrequent: boolean;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
  treatments?: TreatmentRecord[];
  appointments?: Appointment[];
}

export interface PatientFormData {
  name: string;
  address: string;
  telephone: string;
  age: number;
  occupation?: string;
  status?: string;
  complaint?: string;
  gender?: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  allergies?: string;
  faceTemplate?: string;
  dateOfBirth?: Date;
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  dentistId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  dentist?: User;
}

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface AppointmentFormData {
  patientId: string;
  dentistId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  reason?: string;
  notes?: string;
}

// Treatment types
export interface TreatmentRecord {
  id: string;
  patientId: string;
  dentistId?: string;
  recordDate: string;
  recordNo: number;
  description: string;
  treatmentTime?: string;
  debit: number;
  credit: number;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  dentist?: User;
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedTreatments: number;
}

// Face recognition types
export interface FaceMatchResult {
  patient: Patient;
  similarity: number;
}

// QR Code types
export interface QRCodeResponse {
  qrCode: string;
  qrCodeData: string;
}

// Payment types
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

export interface Payment {
  id: string;
  patientId: string;
  appointmentNo: string;
  date: string;
  time: string;
  description: string;
  type: 'debit' | 'credit';
  debit: number;
  credit: number;
  balance: number;
  status: PaymentStatus;
  creditDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  payments: Payment[];
  total: number;
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
}
