/**
 * Seed Script for Patient Data
 * 
 * This script imports the mock patient data from the frontend
 * into the MongoDB database for use with the real API.
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Patient, IPatient } from '../models/Patient';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

// Mock patient data from frontend (mapped to database schema)
const seedPatients = [
  {
    qrCode: 'QR-P1-001',
    name: 'Maria Santos',
    address: '123 Mabini Street, Manila',
    telephone: '09123456789',
    age: 32,
    occupation: 'Teacher',
    status: 'regular' as const,
    complaint: 'Regular checkup',
    gender: 'female' as const,
    email: 'maria.santos@email.com',
    emergencyContact: 'Juan Santos',
    emergencyPhone: '09987654321',
    medicalNotes: 'No known allergies',
    allergies: 'None',
    isFrequent: true,
    lastVisit: new Date('2026-03-15'),
  },
  {
    qrCode: 'QR-P2-002',
    name: 'John Dela Cruz',
    address: '456 Quezon Avenue, Quezon City',
    telephone: '09223334455',
    age: 45,
    occupation: 'Engineer',
    status: 'regular' as const,
    complaint: 'Toothache on lower right molar',
    gender: 'male' as const,
    email: 'john.delacruz@email.com',
    emergencyContact: 'Lisa Dela Cruz',
    emergencyPhone: '09112223333',
    medicalNotes: 'Has diabetes - monitor bleeding',
    allergies: 'Penicillin',
    isFrequent: true,
    lastVisit: new Date('2026-03-20'),
  },
  {
    qrCode: 'QR-P3-003',
    name: 'Ana Reyes',
    address: '789 Taft Street, Pasay',
    telephone: '09334445566',
    age: 28,
    occupation: 'Nurse',
    status: 'new' as const,
    complaint: 'Teeth cleaning',
    gender: 'female' as const,
    email: 'ana.reyes@email.com',
    emergencyContact: 'Mark Reyes',
    emergencyPhone: '09887776655',
    medicalNotes: 'Healthy',
    allergies: 'None',
    isFrequent: false,
    lastVisit: new Date('2026-03-22'),
  },
  {
    qrCode: 'QR-P4-004',
    name: 'Robert Martinez',
    address: '321 EDSA, Mandaluyong',
    telephone: '09445556677',
    age: 55,
    occupation: 'Businessman',
    status: 'regular' as const,
    complaint: 'Denture fitting',
    gender: 'male' as const,
    email: 'robert.martinez@email.com',
    emergencyContact: 'Susan Martinez',
    emergencyPhone: '09556667788',
    medicalNotes: 'Hypertension - monitor stress',
    allergies: 'Aspirin',
    isFrequent: true,
    lastVisit: new Date('2026-03-18'),
  },
  {
    qrCode: 'QR-P5-005',
    name: 'Jennifer Tan',
    address: '654 Makati Avenue, Makati',
    telephone: '09556667788',
    age: 35,
    occupation: 'Accountant',
    status: 'new' as const,
    complaint: 'Cosmetic consultation - veneers',
    gender: 'female' as const,
    email: 'jennifer.tan@email.com',
    emergencyContact: 'David Tan',
    emergencyPhone: '09667778899',
    medicalNotes: 'No medical conditions',
    allergies: 'None',
    isFrequent: false,
    lastVisit: new Date('2026-03-25'),
  },
  {
    qrCode: 'QR-P6-006',
    name: 'Michael Lim',
    address: '987 Bonifacio Street, Taguig',
    telephone: '09667778899',
    age: 42,
    occupation: 'Architect',
    status: 'regular' as const,
    complaint: 'Root canal treatment - upper molar',
    gender: 'male' as const,
    email: 'michael.lim@email.com',
    emergencyContact: 'Grace Lim',
    emergencyPhone: '09778889900',
    medicalNotes: 'Previously had root canal on lower left',
    allergies: 'Codeine',
    isFrequent: true,
    lastVisit: new Date('2026-03-24'),
  },
  {
    qrCode: 'QR-P7-007',
    name: 'Sarah Garcia',
    address: '147 Ateneo Street, Quezon City',
    telephone: '09778889900',
    age: 24,
    occupation: 'Student',
    status: 'regular' as const,
    complaint: 'Braces adjustment',
    gender: 'female' as const,
    email: 'sarah.garcia@email.com',
    emergencyContact: 'James Garcia',
    emergencyPhone: '09889990011',
    medicalNotes: 'Wearing braces since 2024',
    allergies: 'None',
    isFrequent: true,
    lastVisit: new Date('2026-03-21'),
  },
  {
    qrCode: 'QR-P8-008',
    name: 'David Nguyen',
    address: '258 Rockwell Avenue, Makati',
    telephone: '09889990011',
    age: 38,
    occupation: 'IT Manager',
    status: 'new' as const,
    complaint: 'Emergency - broken tooth',
    gender: 'male' as const,
    email: 'david.nguyen@email.com',
    emergencyContact: 'Linda Nguyen',
    emergencyPhone: '09990001122',
    medicalNotes: 'Sports accident - tooth damaged',
    allergies: 'Lidocaine',
    isFrequent: false,
    lastVisit: new Date('2026-03-26'),
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    // Check if patients already exist
    const existingCount = await Patient.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing patients in database`);
      
      // Ask if user wants to clear existing data
      const response = await askToClearData();
      if (response === 'clear') {
        await Patient.deleteMany({});
        logger.info('🗑️ Cleared existing patient data');
      } else {
        logger.info('📝 Keeping existing patient data, will skip duplicates');
      }
    }

    // Seed patients (skip duplicates based on qrCode or telephone)
    let seededCount = 0;
    for (const patientData of seedPatients) {
      // Check if patient already exists by qrCode or telephone
      const existingPatient = await Patient.findOne({
        $or: [
          { qrCode: patientData.qrCode },
          { telephone: patientData.telephone }
        ]
      });

      if (!existingPatient) {
        const patient = await Patient.create(patientData);
        seededCount++;
        logger.info(`✅ Seeded patient: ${patient.name} (${patient._id})`);
      } else {
        logger.info(`⏭️ Skipped duplicate: ${patientData.name} (already exists)`);
      }
    }

    logger.info(`🎉 Seed complete! ${seededCount} new patients added`);
    
    // Display summary
    const totalPatients = await Patient.countDocuments();
    logger.info(`📊 Total patients in database: ${totalPatients}`);

  } catch (error) {
    logger.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

function askToClearData(): Promise<'clear' | 'keep'> {
  return new Promise((resolve) => {
    // For automated scripts, we'll default to keep existing data
    // In interactive mode, you can prompt the user
    resolve('keep');
  });
}

// Run the seed
seedDatabase();