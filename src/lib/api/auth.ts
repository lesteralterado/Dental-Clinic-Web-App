import apiClient from './client';
import { AuthResponse, User } from '../types';

// Demo user for mock authentication
const DEMO_USER: User = {
  id: 'demo-admin-001',
  email: 'admin@dental.com',
  name: 'Admin User',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo credentials
const DEMO_EMAIL = 'admin@dental.com';
const DEMO_PASSWORD = 'admin123';

// Check if we're in demo mode (no backend available)
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_API_URL === undefined;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Check for demo credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Return mock response for demo
      const mockToken = 'demo-access-token-' + Date.now();
      const mockRefreshToken = 'demo-refresh-token-' + Date.now();
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', mockRefreshToken);
      localStorage.setItem('demoUser', JSON.stringify(DEMO_USER));
      
      return {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
        user: DEMO_USER,
      };
    }
    
    // Try real API call
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // If API fails, check if it might be demo credentials
      throw new Error('Login failed. Please try again.');
    }
  },

  async register(email: string, password: string, name: string, role?: string): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', {
      email,
      password,
      name,
      role,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    // Check for demo user in localStorage
    const demoUserStr = localStorage.getItem('demoUser');
    if (demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        if (demoUser && demoUser.email === DEMO_EMAIL) {
          return demoUser as User;
        }
      } catch (e) {
        // Invalid demo user data, clear it
        localStorage.removeItem('demoUser');
      }
    }
    
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoUser');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  // Password Reset Methods
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  async validateResetToken(token: string): Promise<{ valid: boolean; message: string; expiresAt?: Date }> {
    const response = await apiClient.get<{ valid: boolean; message: string; expiresAt?: Date }>(
      `/auth/validate-reset-token?token=${token}`
    );
    return response.data;
  },
};

export default authService;