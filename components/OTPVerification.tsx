'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OTPVerificationProps {
  phone: string;
  type: 'signup' | 'login' | 'password_reset';
  onSuccess: () => void;
  onBack: () => void;
  onResend?: () => void;
  className?: string;
}

export default function OTPVerification({
  phone,
  type,
  onSuccess,
  onBack,
  onResend,
  className = ''
}: OTPVerificationProps) {
  const { verifyOTP, sendOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await verifyOTP(phone, otpString, type);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await sendOTP(phone, type);
      if (success) {
        setResendCooldown(60); // 60 seconds cooldown
        onResend?.();
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'signup':
        return 'Verify Your Phone Number';
      case 'login':
        return 'Enter Verification Code';
      case 'password_reset':
        return 'Verify Identity';
      default:
        return 'Verify OTP';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'signup':
        return `We've sent a 6-digit verification code to ${phone}. Please enter it below to complete your registration.`;
      case 'login':
        return `We've sent a 6-digit verification code to ${phone}. Please enter it below to continue.`;
      case 'password_reset':
        return `We've sent a 6-digit verification code to ${phone}. Please enter it below to reset your password.`;
      default:
        return `We've sent a 6-digit verification code to ${phone}. Please enter it below.`;
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="card">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getTitle()}
          </h2>
          <p className="text-gray-600">
            {getDescription()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Having trouble?</strong> Check your SMS messages or try requesting a new code. 
            The verification code expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
