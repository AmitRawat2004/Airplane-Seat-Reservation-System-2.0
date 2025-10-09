export interface User {
  id: string;
  phone: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
  securitySettings?: SecuritySettings;
  // Optional booking/passenger info
  passportNumber?: string;
  passportCountry?: string;
  dateOfBirth?: string; // ISO date string
}

export interface UserPreferences {
  notifications: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  trustedDevices: TrustedDevice[];
  lastPasswordChange?: Date;
}

export interface TrustedDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  lastUsed: Date;
  location?: string;
  ipAddress?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phone: string;
  password?: string;
  otp?: string;
  rememberDevice?: boolean;
}

export interface SignupData {
  phone: string;
  email?: string;
  password: string;
  otp: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  passportNumber?: string;
  passportCountry?: string;
  dateOfBirth?: string;
}

export interface OTPRequest {
  phone: string;
  type: 'signup' | 'login' | 'password_reset' | 'sensitive_action';
  method: 'sms' | 'whatsapp' | 'voice';
}

export interface OTPVerification {
  phone: string;
  otp: string;
  type: 'signup' | 'login' | 'password_reset' | 'sensitive_action';
}

export interface SocialLoginData {
  provider: 'google' | 'apple';
  token: string;
  phone?: string; // Required for phone verification
}

export interface TwoFactorChallenge {
  required: boolean;
  reason: 'new_device' | 'new_location' | 'suspicious_activity' | 'sensitive_action';
  methods: ('otp' | 'authenticator')[];
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  requiresAdditionalVerification: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  twoFactorChallenge?: TwoFactorChallenge;
  riskAssessment?: RiskAssessment;
  error?: string;
}

export interface PasswordResetRequest {
  phone: string;
  method: 'sms' | 'email';
}

export interface PasswordReset {
  phone: string;
  otp: string;
  newPassword: string;
}
