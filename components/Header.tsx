'use client';

import { Plane, Menu, X, User, LogOut, Settings, DollarSign, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTranslation } from '@/lib/i18n';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { preferences, setCurrency, setLanguage, currencies, languages } = usePreferences();
  const { t } = useTranslation();

  const selectCurrency = (currency: typeof currencies[0]) => {
    setCurrency(currency);
    setIsCurrencyOpen(false);
  };

  const selectLanguage = (language: typeof languages[0]) => {
    setLanguage(language);
    setIsLanguageOpen(false);
  };

  // Close dropdowns when clicking outside
  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              SkyReserve
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              {t('home')}
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/bookings" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {t('myBookings')}
                </Link>
              </>
            )}
            <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
              {t('contact')}
            </Link>
            
            {/* Currency and Language Dropdowns */}
            <div className="flex items-center space-x-2">
              {/* Currency Dropdown */}
              <div className="relative" ref={currencyRef}>
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>{preferences.currency.code}</span>
                </button>
                
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => selectCurrency(currency)}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                          preferences.currency.code === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-2">{currency.symbol}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="ml-2 text-gray-500">{currency.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Dropdown */}
              <div className="relative" ref={languageRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <Globe className="h-4 w-4" />
                  <span className="max-w-16 truncate">{preferences.language.name}</span>
                </button>
                
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => selectLanguage(language)}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                          preferences.language.name === language.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-2 text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Authentication Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {user?.firstName ? user.firstName : (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName ? user.firstName : (user?.email ? user.email : 'User')}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('profile')}
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('settings')}
                    </Link>
                    <Link
                      href="/bookings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('myBookings')}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    href="/bookings" 
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Currency and Language Dropdowns */}
              <div className="pt-2 space-y-2">
                {/* Mobile Currency Dropdown */}
                <div>
                  <button
                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium w-full"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>{preferences.currency.code}</span>
                  </button>
                  
                  {isCurrencyOpen && (
                    <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => selectCurrency(currency)}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                            preferences.currency.code === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span className="mr-2">{currency.symbol}</span>
                          <span className="font-medium">{currency.code}</span>
                          <span className="ml-2 text-gray-500">{currency.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Language Dropdown */}
                <div>
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium w-full"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="max-w-16 truncate">{preferences.language.name}</span>
                  </button>
                  
                  {isLanguageOpen && (
                    <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => selectLanguage(language)}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                            preferences.language.name === language.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span className="mr-2 text-lg">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-2 py-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName ? user.firstName : (user?.email ? user.email : 'User')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                          href="/auth/login"
                          className="block text-gray-600 hover:text-primary-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('signIn')}
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('signUp')}
                        </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
