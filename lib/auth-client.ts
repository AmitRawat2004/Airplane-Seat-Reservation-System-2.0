import { User } from '@/types/auth';

// OTP generation and validation
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPValid(otp: string, storedOTP: string, expiryTime: number): boolean {
  if (otp !== storedOTP) return false;
  if (Date.now() > expiryTime) return false;
  return true;
}

// Phone number validation
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Risk assessment
export function assessRisk(
  user: User | null,
  action: string,
  context: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceId?: string;
  }
): { riskLevel: 'low' | 'medium' | 'high'; factors: string[]; requiresAdditionalVerification: boolean } {
  const factors: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Check for new device
  if (user?.securitySettings?.trustedDevices) {
    const isTrustedDevice = user.securitySettings.trustedDevices.some(
      device => device.deviceId === context.deviceId
    );
    if (!isTrustedDevice) {
      factors.push('New device detected');
      riskLevel = 'medium';
    }
  }

  // Check for new location
  if (user?.securitySettings?.trustedDevices) {
    const hasLocationHistory = user.securitySettings.trustedDevices.some(
      device => device.location === context.location
    );
    if (!hasLocationHistory && context.location) {
      factors.push('New location detected');
      riskLevel = 'high';
    }
  }

  // Check for sensitive actions
  const sensitiveActions = ['payment', 'password_reset', 'account_update'];
  if (sensitiveActions.includes(action)) {
    factors.push('Sensitive action');
    riskLevel = 'high';
  }

  // Check for recent account creation
  if (user && Date.now() - user.createdAt.getTime() < 24 * 60 * 60 * 1000) {
    factors.push('Recently created account');
    riskLevel = 'medium';
  }

  // Determine if additional verification is required
  const requiresAdditionalVerification = riskLevel === 'high' || riskLevel === 'medium';

  return { riskLevel, factors, requiresAdditionalVerification };
}

// Device fingerprinting (client-side only)
export function generateDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return Math.random().toString(36).substring(2, 15);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('Device fingerprint', 2, 2);
  const fingerprint = canvas.toDataURL();
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}
