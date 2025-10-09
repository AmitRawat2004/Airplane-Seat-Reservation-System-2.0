"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Shield, Bell, Lock, Globe, CreditCard, Smartphone, Languages, DollarSign, Moon, Sun, Type, Monitor } from 'lucide-react';

type SettingsForm = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
  darkMode: boolean;
  textSize: 'small' | 'medium' | 'large';
};

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { preferences, setCurrency, setLanguage, currencies, languages } = usePreferences();
  const [form, setForm] = useState<SettingsForm>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
    darkMode: false,
    textSize: 'medium'
  });
  const [saving, setSaving] = useState(false);

  // Apply appearance settings to the page
  useEffect(() => {
    // Apply dark mode
    if (form.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply text size
    const textSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem'
    };
    document.documentElement.style.fontSize = textSizeMap[form.textSize];

  }, [form.darkMode, form.textSize]);

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appearance-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setForm(prev => ({ ...prev, ...settings }));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appearance-settings', JSON.stringify({
      darkMode: form.darkMode,
      textSize: form.textSize
    }));
  }, [form.darkMode, form.textSize]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <p className="text-gray-700">Please sign in to view your settings.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Here you would typically save settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // Settings are already saved to localStorage automatically
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="page-wrapper" className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security settings.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <div className="md:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                <nav className="space-y-2">
                  <a href="#notifications" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <Bell className="h-4 w-4 inline mr-2" />
                    Notifications
                  </a>
                  <a href="#security" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Security
                  </a>
                  <a href="#appearance" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <Monitor className="h-4 w-4 inline mr-2" />
                    Appearance
                  </a>
                  <a href="#payment" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Payment
                  </a>
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="md:col-span-2">
              {/* Quick Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Languages className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Language</h3>
                        <p className="text-xs text-gray-600">Change your preferred language</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = languages.findIndex(l => l.code === preferences.language.code);
                        const nextIndex = (currentIndex + 1) % languages.length;
                        setLanguage(languages[nextIndex]);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {preferences.language.name}
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Currency</h3>
                        <p className="text-xs text-gray-600">Switch your display currency</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = currencies.findIndex(c => c.code === preferences.currency.code);
                        const nextIndex = (currentIndex + 1) % currencies.length;
                        setCurrency(currencies[nextIndex]);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      {preferences.currency.code} ({preferences.currency.symbol})
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Notifications Section */}
                <div className="card" id="notifications">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                        <p className="text-sm text-gray-600">Receive booking confirmations and updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={form.emailNotifications}
                        onChange={onChange}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                        <p className="text-sm text-gray-600">Receive urgent updates via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        checked={form.smsNotifications}
                        onChange={onChange}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Marketing Emails</label>
                        <p className="text-sm text-gray-600">Receive promotional offers and travel tips</p>
                      </div>
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={form.marketingEmails}
                        onChange={onChange}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="card" id="security">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={form.twoFactorAuth}
                        onChange={onChange}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="button" className="text-sm text-primary-600 hover:text-primary-700">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appearance Section */}
                <div className="card" id="appearance">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Monitor className="h-5 w-5 mr-2" />
                      Appearance Settings
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          {form.darkMode ? (
                            <Moon className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Sun className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900">Dark Mode</label>
                          <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setForm(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Text Size Controls */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Text Size</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Type className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Size:</span>
                        </div>
                        <div className="flex space-x-2">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => setForm(prev => ({ ...prev, textSize: size }))}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                form.textSize === size
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
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
