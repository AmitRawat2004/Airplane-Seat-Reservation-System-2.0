'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, SignupData, AuthResponse } from '@/types/auth';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  sendOTP: (phone: string, type: 'signup' | 'login' | 'password_reset') => Promise<boolean>;
  verifyOTP: (phone: string, otp: string, type: 'signup' | 'login' | 'password_reset') => Promise<boolean>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const { user } = await response.json();
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        toast.success('Login successful!');
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed',
        }));
        toast.error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      const errorMessage = 'Network error during login';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (data: SignupData): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        toast.success('Account created successfully!');
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Signup failed',
        }));
        toast.error(result.error || 'Signup failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Network error during signup';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      toast.success('Logged out successfully');
    }
  };

  const sendOTP = async (phone: string, type: 'signup' | 'login' | 'password_reset'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, type }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('OTP sent successfully!');
        return true;
      } else {
        toast.error(data.error || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      toast.error('Network error while sending OTP');
      return false;
    }
  };

  const verifyOTP = async (phone: string, otp: string, type: 'signup' | 'login' | 'password_reset'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, type }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('OTP verified successfully!');
        return true;
      } else {
        toast.error(data.error || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      toast.error('Network error while verifying OTP');
      return false;
    }
  };

  const resetPassword = async (phone: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset successfully!');
        return true;
      } else {
        toast.error(data.error || 'Failed to reset password');
        return false;
      }
    } catch (error) {
      toast.error('Network error while resetting password');
      return false;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) return;

    try {
      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
        }));
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Network error while updating profile');
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const { user } = await response.json();
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
    resetPassword,
    updateUser,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
