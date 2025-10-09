'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OTPVerification from './OTPVerification';
import { validatePhoneNumber } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  className?: string;
}

type SignupStep = 'phone' | 'otp' | 'details' | 'complete';

export default function SignupForm({ onSuccess, onSwitchToLogin, className = '' }: SignupFormProps) {
  const { signup, sendOTP } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<SignupStep>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validatePhoneNumber(formData.phone)) {
      setError(t('Please enter a valid phone number') || 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await sendOTP(formData.phone, 'signup');
      if (success) {
        setStep('otp');
      }
    } catch (error) {
      setError(t('Failed to send verification code. Please try again.') || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.password) {
      setError(t('Password is required') || 'Password is required');
      return;
    }

    if (formData.password.length < 8) {
      setError(t('Password must be at least 8 characters long') || 'Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('Passwords do not match') || 'Passwords do not match');
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('Please enter a valid email address') || 'Please enter a valid email address');
      return;
    }

    if (!formData.agreeToTerms) {
      setError(t('Please agree to the terms and conditions') || 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup({
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        otp: '', // OTP already verified in previous step
      });

      if (result.success) {
        setStep('complete');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
    setError(result.error || t('Signup failed. Please try again.') || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError(t('Network error. Please try again.') || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
    } else if (step === 'details') {
      setStep('otp');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        phone={formData.phone}
        type="signup"
        onSuccess={handleOTPSuccess}
        onBack={handleBack}
        className={className}
      />
    );
  }

  if (step === 'complete') {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="card text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to SkyReserve! Your account has been created and verified.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('createAccountTitle')}
          </h2>
          <p className="text-gray-600">
            {step === 'phone' ? t('enterPhone') : t('Complete your account setup')}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneNumber')} *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("We'll send you a verification code via SMS") || "We'll send you a verification code via SMS"}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.phone}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('sendingCode') : t('sendVerificationCode')}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('signIn')}
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For booking confirmations and updates
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword || !formData.agreeToTerms}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                ← Back to phone verification
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
