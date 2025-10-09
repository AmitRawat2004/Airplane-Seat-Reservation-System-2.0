import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({
        user: null
      }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      user: null
    }, { status: 401 });
  }
}
