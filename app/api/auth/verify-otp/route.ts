import { NextRequest, NextResponse } from 'next/server';
import { isOTPValid } from '@/lib/auth-client';

// Mock OTP store - replace with actual database/cache
const otpStore: Map<string, { otp: string; expiry: number; type: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, type } = body;

    // Validate required fields
    if (!phone || !otp || !type) {
      return NextResponse.json({
        success: false,
        error: 'Phone number, OTP, and type are required'
      }, { status: 400 });
    }

    // Get stored OTP
    const storedOTP = otpStore.get(phone);
    if (!storedOTP) {
      return NextResponse.json({
        success: false,
        error: 'No OTP found for this phone number'
      }, { status: 400 });
    }

    // Verify OTP
    const isValid = isOTPValid(otp, storedOTP.otp, storedOTP.expiry);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired OTP'
      }, { status: 400 });
    }

    // Check if OTP type matches
    if (storedOTP.type !== type) {
      return NextResponse.json({
        success: false,
        error: 'OTP type mismatch'
      }, { status: 400 });
    }

    // Remove used OTP
    otpStore.delete(phone);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
