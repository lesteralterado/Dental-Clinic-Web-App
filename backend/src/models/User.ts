import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Password reset fields
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  passwordHistory?: Array<{
    password: string;
    changedAt: Date;
  }>;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'receptionist'],
      default: 'receptionist',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset fields
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
    // Password history for preventing reuse
    passwordHistory: {
      type: [{
        password: String,
        changedAt: Date,
      }],
      default: [],
    },
    // Account lockout for failed login attempts
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for role-based queries
userSchema.index({ role: 1 });

// Index for active user filtering
userSchema.index({ isActive: 1 });

// Index for password reset lookups (sparse - only indexes documents with this field)
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', userSchema);

export default User;
