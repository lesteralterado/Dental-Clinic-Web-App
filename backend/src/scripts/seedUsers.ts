/**
 * Seed Script for Users
 * 
 * This script creates default admin/doctor/receptionist users
 * for the dental clinic application.
 * 
 * Usage: npm run seed:users
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

// Default users to seed
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@dentalclinic.com',
    password: 'admin123',
    role: 'admin' as const,
    isActive: true,
  },
  {
    name: 'Dr. Maria Santos',
    email: 'doctor@dentalclinic.com',
    password: 'doctor123',
    role: 'doctor' as const,
    isActive: true,
  },
  {
    name: 'Receptionist Jane',
    email: 'receptionist@dentalclinic.com',
    password: 'receptionist123',
    role: 'receptionist' as const,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing users in database`);
      
      // Delete existing users to re-seed with properly hashed passwords
      await User.deleteMany({});
      logger.info('🗑️ Cleared existing user data to re-seed with proper password hashing');
    }

    // Seed users (skip duplicates based on email)
    let seededCount = 0;
    for (const userData of seedUsers) {
      // Check if user already exists by email
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        // Let Mongoose pre-save hook handle password hashing
        const user = await User.create({
          ...userData,
        });
        seededCount++;
        logger.info(`✅ Seeded user: ${user.name} (${user.role}) - ${user.email}`);
      } else {
        logger.info(`⏭️ Skipped duplicate: ${userData.email} (already exists)`);
      }
    }

    logger.info(`🎉 User seed complete! ${seededCount} new users added`);
    
    // Display summary
    const totalUsers = await User.countDocuments();
    logger.info(`📊 Total users in database: ${totalUsers}`);
    
    // Display login credentials
    logger.info('📋 Default login credentials:');
    logger.info('  Admin: admin@dentalclinic.com / admin123');
    logger.info('  Doctor: doctor@dentalclinic.com / doctor123');
    logger.info('  Receptionist: receptionist@dentalclinic.com / receptionist123');

  } catch (error) {
    logger.error('❌ User seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed
seedDatabase();