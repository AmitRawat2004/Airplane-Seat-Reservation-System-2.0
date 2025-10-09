import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhone, users } from '@/lib/mock-users';

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();

    // In this dev implementation we identify user via phone provided in body (or from session)
    const phone = updates.phone;
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required to identify user' }, { status: 400 });
    }

    const user = getUserByPhone(phone);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Apply allowed updates
    const allowed = ['firstName','middleName','lastName','email','passportNumber','passportCountry','dateOfBirth','preferences'];
    for (const key of Object.keys(updates)) {
      if (allowed.includes(key)) {
        (user as any)[key] = updates[key];
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Update user error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
