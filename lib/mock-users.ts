import bcrypt from 'bcryptjs';

// Simple in-memory users store for development/testing only
// DO NOT use this in production
export const users: any[] = [];

// Seed two test users: admin and passenger
const seed = () => {
  if (users.length > 0) return;

  const adminPassword = 'adminpass';
  const passengerPassword = 'pass1234';

  const admin = {
    id: 'user-admin-1',
    phone: '+12345678901',
    email: 'admin@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: new Date(),
    lastLoginAt: null,
    preferences: {},
    securitySettings: { trustedDevices: [] },
    // store hashed password for login checks
    passwordHash: bcrypt.hashSync(adminPassword, 12),
    role: 'admin'
  };

  const passenger = {
    id: 'user-passenger-1',
    phone: '+19876543210',
    email: 'passenger@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: new Date(),
    lastLoginAt: null,
    preferences: {},
    securitySettings: { trustedDevices: [] },
    passwordHash: bcrypt.hashSync(passengerPassword, 12),
    role: 'passenger'
  };

  users.push(admin, passenger);
};

seed();

export function getUserByPhone(phone: string) {
  return users.find(u => u.phone === phone || u.phone === `+${phone.replace(/^\+/, '')}`);
}

export function addUser(user: any) {
  users.push(user);
}
