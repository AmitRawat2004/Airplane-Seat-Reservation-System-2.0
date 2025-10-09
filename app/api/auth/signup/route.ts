import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth-server';
import { User, SignupData, AuthResponse } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { addUser, getUserByPhone } from '@/lib/mock-users';
// keep per-file otpStore as current repo uses it; consider centralizing later
const otpStore: Map<string, { otp: string; expiry: number; type: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: SignupData = await request.json();
  const { phone, email, password, otp, firstName, middleName, lastName, passportNumber, passportCountry, dateOfBirth } = body;

    // Validate required fields
    if (!phone || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Phone number and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = getUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'User with this phone number already exists'
      }, { status: 409 });
    }

    // Verify OTP (in real implementation, this would be verified against stored OTP)
    const storedOTP = otpStore.get(phone);
    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiry) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid or expired OTP'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user (include passenger details for booking)
    const newUser: any = {
      id: uuidv4(),
      phone,
      email,
      firstName,
      middleName,
      lastName,
      passportNumber,
      passportCountry,
      dateOfBirth,
      isPhoneVerified: true,
      isEmailVerified: email ? false : true, // Email verification would be separate
      createdAt: new Date(),
      preferences: {
        notifications: {
          sms: true,
          email: email ? true : false,
          push: false,
        },
        language: 'en',
        currency: 'USD',
      },
      securitySettings: {
        twoFactorEnabled: false,
        biometricEnabled: false,
        trustedDevices: [],
      },
    };

    // Hash and attach password so login can validate
    (newUser as any).passwordHash = await bcrypt.hash(password, 12);

    // Store user (in-memory mock for dev)
    addUser(newUser);

    // Remove used OTP
    otpStore.delete(phone);

    // Create session
    await createSession(newUser);

    return NextResponse.json<AuthResponse>({
      success: true,
      user: newUser,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
