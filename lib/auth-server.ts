import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/types/auth';

const secretKey = process.env.AUTH_SECRET || 'your-secret-key-here';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user, expires });

  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function getSession(): Promise<{ user: User } | null> {
  const session = cookies().get('session')?.value;
  if (!session) return null;

  try {
    const payload = await decrypt(session);
    return { user: payload.user };
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session');
}
