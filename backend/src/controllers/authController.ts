import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import authService from '../services/authService';

export const authController = {
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.json({
        message: 'Login successful',
        token: result.token,
        user: {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;
      const result = await authService.register({ email, password, name, role });

      res.status(201).json({
        message: 'Registration successful',
        token: result.token,
        user: {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!._id.toString());

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      await authService.logout(req.user!._id.toString());
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

export default authController;
