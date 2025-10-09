import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
