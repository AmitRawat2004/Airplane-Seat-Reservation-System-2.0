"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Shield, Calendar, Mail, Phone } from 'lucide-react';

type ProfileForm = {
  phone: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  passportNumber: string;
  passportCountry: string;
  dateOfBirth: string;
};

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        email: user.email || '',
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        passportNumber: user.passportNumber || '',
        passportCountry: user.passportCountry || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <p className="text-gray-700">{t('pleaseSignIn') || 'Please sign in to view your profile.'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (data: ProfileForm) => {
    const newErrors: Record<string, string> = {};
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Enter a valid email.';
    }
    if (data.firstName && data.firstName.length > 50) newErrors.firstName = 'Max 50 characters.';
    if (data.lastName && data.lastName.length > 50) newErrors.lastName = 'Max 50 characters.';
    if (data.passportNumber && data.passportNumber.length > 20) newErrors.passportNumber = 'Max 20 characters.';
    return newErrors;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      await updateUser(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('profile')}</h1>
            <p className="text-gray-600">{t('managePersonalDetails') || 'Manage your personal details for faster bookings.'}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card md:col-span-1">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <UserIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {(user?.firstName || user?.email?.split('@')[0] || 'User')}
                  </p>
                  <p className="text-sm text-gray-600">Member since {new Date(user!.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={onSubmit} className="card space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('firstName')}</label>
                    <input name="firstName" value={form?.firstName || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('middleName')}</label>
                    <input name="middleName" value={form?.middleName || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('lastName')}</label>
                    <input name="lastName" value={form?.lastName || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                      <input name="email" value={form?.email || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2 pl-9" />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('phoneNumber')}</label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                      <input name="phone" value={form?.phone || ''} readOnly className="mt-1 block w-full border rounded p-2 pl-9 bg-gray-50" />
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">{t('dateOfBirth')}</label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                      <input type="date" name="dateOfBirth" value={form?.dateOfBirth || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2 pl-9" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('passportNumber')}</label>
                    <input name="passportNumber" value={form?.passportNumber || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
                    {errors.passportNumber && <p className="text-red-600 text-sm mt-1">{errors.passportNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('passportCountry')}</label>
                    <input name="passportCountry" value={form?.passportCountry || ''} onChange={onChange} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    {t('yourDataStoredSecurely') || 'Your data is stored securely and only used for bookings.'}
                  </div>
                  <button disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-60">
                    {saving ? t('saving') || 'Saving…' : t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
