'use client';

import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OTPVerification from './OTPVerification';
import { validatePhoneNumber } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  className?: string;
}

type LoginMethod = 'password' | 'otp';
type LoginStep = 'method' | 'otp' | 'complete';

export default function LoginForm({ onSuccess, onSwitchToSignup, className = '' }: LoginFormProps) {
  const { login, sendOTP } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<LoginStep>('method');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberDevice: false,
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validatePhoneNumber(formData.phone)) {
      setError(t('pleaseEnterValidPhone') || 'Please enter a valid phone number');
      return;
    }

    if (loginMethod === 'password' && !formData.password) {
      setError(t('passwordIsRequired') || 'Password is required');
      return;
    }

    setIsLoading(true);

    try {
      if (loginMethod === 'otp') {
        // Send OTP for passwordless login
        const success = await sendOTP(formData.phone, 'login');
        if (success) {
          setStep('otp');
        }
      } else {
        // Login with password
        const result = await login({
          phone: formData.phone,
          password: formData.password,
          rememberDevice: formData.rememberDevice,
        });

        if (result.success) {
          setStep('complete');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else if (result.requiresTwoFactor) {
          // If 2FA is required, switch to OTP verification
          setStep('otp');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setStep('complete');
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('method');
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
        type="login"
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
            <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Successful!
          </h2>
          <p className="text-gray-600">
            Welcome back! Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('welcomeBack')}
          </h2>
          <p className="text-gray-600">
            {t('welcomeBackSubtitle')}
          </p>
        </div>

        <form onSubmit={handleMethodSubmit} className="space-y-4">
          {/* Phone Number */}
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
          </div>

          {/* Login Method Selection */}
          <div className="space-y-3">
            <div className="flex space-x-4">
                <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginMethod === 'password'
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {t('Password')}
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginMethod === 'otp'
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                OTP (Passwordless)
              </button>
            </div>
          </div>

          {/* Password Field (only for password method) */}
          {loginMethod === 'password' && (
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
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
            </div>
          )}

          {/* Remember Device (only for password method) */}
          {loginMethod === 'password' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={formData.rememberDevice}
                onChange={(e) => handleInputChange('rememberDevice', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
                <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-600">
                {t('rememberDevice')}
              </label>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.phone || (loginMethod === 'password' && !formData.password)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                {loginMethod === 'otp' ? t('sendingLoginCode') || 'Sending Code...' : t('signingIn') || 'Signing In...'}
              </div>
            ) : (
              loginMethod === 'otp' ? t('sendVerificationCode') : t('signIn')
            )}
          </button>

          {/* Forgot Password */}
          {loginMethod === 'password' && (
            <div className="text-center">
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {t('forgotPassword')}
              </button>
            </div>
          )}

          {/* Switch to Signup */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </form>

        {/* Social Login (Optional) */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              <span className="ml-2">Apple</span>
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Social login requires phone verification for booking updates
          </p>
        </div>
      </div>
    </div>
  );
}
