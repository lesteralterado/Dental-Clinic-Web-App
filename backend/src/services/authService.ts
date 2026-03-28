import { User, IUser } from '../models';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'doctor' | 'receptionist';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: IUser; token: string }> {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 401);
    }

    const token = generateToken(user._id.toString());
    
    logger.info(`User ${user.email} logged in successfully`);

    return { user, token };
  },

  async register(data: RegisterData): Promise<{ user: IUser; token: string }> {
    const { email, password, name, role } = data;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'receptionist',
    });

    const token = generateToken(user._id.toString());
    
    logger.info(`New user registered: ${user.email}`);

    return { user, token };
  },

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async refreshToken(userId: string): Promise<string> {
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    return generateToken(user._id.toString());
  },

  async logout(userId: string): Promise<void> {
    logger.info(`User ${userId} logged out`);
  },
};

export default authService;
