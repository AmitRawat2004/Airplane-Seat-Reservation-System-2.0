import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, validatePhoneNumber } from '@/lib/auth-client';

// Mock OTP store - replace with actual database/cache
const otpStore: Map<string, { otp: string; expiry: number; type: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type, method = 'sms' } = body;

    // Validate phone number
    if (!phone || !validatePhoneNumber(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number'
      }, { status: 400 });
    }

    // Validate type
    const validTypes = ['signup', 'login', 'password_reset', 'sensitive_action'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP type'
      }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phone, { otp, expiry, type });

    // In a real implementation, you would send the OTP via SMS/WhatsApp/Voice
    // For now, we'll just log it (remove this in production)
    console.log(`OTP for ${phone}: ${otp} (expires in 10 minutes)`);

    // Mock SMS/WhatsApp/Voice sending
    const sendResult = await sendOTP(phone, otp, method);

    if (sendResult.success) {
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${phone}`,
        method,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send verification code'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Mock function to send OTP - replace with actual SMS/WhatsApp/Voice service
async function sendOTP(phone: string, otp: string, method: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock different delivery methods
  switch (method) {
    case 'sms':
      console.log(`SMS sent to ${phone}: Your verification code is ${otp}`);
      break;
    case 'whatsapp':
      console.log(`WhatsApp sent to ${phone}: Your verification code is ${otp}`);
      break;
    case 'voice':
      console.log(`Voice call to ${phone}: Your verification code is ${otp}`);
      break;
    default:
      console.log(`SMS sent to ${phone}: Your verification code is ${otp}`);
  }

  // In production, integrate with services like:
  // - Twilio (SMS/Voice)
  // - WhatsApp Business API
  // - AWS SNS
  // - Firebase Auth
  // - Auth0

  return { success: true };
}
