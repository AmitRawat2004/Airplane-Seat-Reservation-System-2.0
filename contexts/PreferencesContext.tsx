'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface PreferencesState {
  currency: Currency;
  language: Language;
}

interface PreferencesContextType {
  preferences: PreferencesState;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  currencies: Currency[];
  languages: Language[];
  // helper to format a USD amount into selected currency
  formatPrice: (amountInUSD: number) => string;
  // optional exchange rates map
  exchangeRates?: Record<string, number>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const currencies: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' }
];

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

const defaultPreferences: PreferencesState = {
  currency: currencies[0], // INR
  language: languages[0] // English
};

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences);
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  // Fetch exchange rates (base USD) and cache for 1 hour
  useEffect(() => {
    const cached = localStorage.getItem('exchange-rates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 1000 * 60 * 60) {
          setRates(parsed.rates);
        }
      } catch (e) {
        // ignore
      }
    }

    async function fetchRates() {
      try {
        const res = await fetch('https://api.exchangerate.host/latest?base=USD');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          localStorage.setItem('exchange-rates', JSON.stringify({ ts: Date.now(), rates: data.rates }));
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates', err);
      }
    }

    if (!rates) fetchRates();
  }, []);

  // Helper: format a USD amount into selected currency
  const formatPrice = (amountInUSD: number) => {
    const target = preferences.currency.code || 'INR';
    const rate = rates && rates[target] ? rates[target] : null;
    const converted = rate ? amountInUSD * rate : amountInUSD;
    // use Intl.NumberFormat with currency
    try {
      return new Intl.NumberFormat(preferences.language.code, { style: 'currency', currency: target }).format(converted);
    } catch (e) {
      // fallback
      return `${preferences.currency.symbol}${converted.toFixed(2)}`;
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        // Validate that the saved preferences exist in our arrays
        const savedCurrency = currencies.find(c => c.code === parsed.currency?.code);
        const savedLanguage = languages.find(l => l.code === parsed.language?.code);
        
        if (savedCurrency && savedLanguage) {
          setPreferences({
            currency: savedCurrency,
            language: savedLanguage
          });
        }
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setCurrency = (currency: Currency) => {
    setPreferences(prev => ({ ...prev, currency }));
  };

  const setLanguage = (language: Language) => {
    setPreferences(prev => ({ ...prev, language }));
  };

  const value: PreferencesContextType = {
    preferences,
    setCurrency,
    setLanguage,
    currencies,
    languages
    ,
    // expose rates and helper
    formatPrice,
    exchangeRates: rates || undefined,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
