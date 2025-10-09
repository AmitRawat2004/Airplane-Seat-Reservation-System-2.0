"use client";

import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n';
import AIChatbot from '@/components/AIChatbot';
import { MessageCircle, Phone, Mail } from 'lucide-react';

const faqs: { title: string; prompt: string }[] = [
  {
    title: 'Change or cancel my booking',
    prompt: 'I need to change or cancel my booking. What are my options and steps?'
  },
  {
    title: 'Seat selection help',
    prompt: 'How can I change my seat after booking? Are there any fees?'
  },
  {
    title: 'Baggage policy',
    prompt: 'What is the baggage allowance for my flight and what are the overweight fees?'
  },
  {
    title: 'Payment issue',
    prompt: 'My payment failed but I was charged. How can I resolve this?'
  },
  {
    title: 'Account & profile',
    prompt: 'How do I update my profile, enable 2FA, or reset my password?'
  }
];

export default function ContactPage() {
  const { t } = useTranslation();
  const openChatWith = (message: string) => {
    const event = new CustomEvent('open-ai-chat', { detail: { message } });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 mb-4">
              <MessageCircle className="h-7 w-7 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('contactSupport') || 'Contact Support'}</h1>
            <p className="text-gray-600 mt-2">{t('contactSubtitle') || 'Get instant help from our AI assistant, or browse common questions.'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('quickHelpTopics') || 'Quick help topics'}</h2>
              <div className="space-y-2">
                {faqs.map((f) => (
                  <button
                    key={f.title}
                    onClick={() => openChatWith(f.prompt)}
                    className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{f.title}</div>
                    <div className="text-sm text-gray-600">{f.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('tips') || 'Tips'}</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>{t('tipBookingId') || 'Have your booking ID ready for faster assistance.'}</li>
                <li>{t('tipClearQuestions') || 'Use clear, concise questions for the best results.'}</li>
                <li>{t('tipFollowUp') || 'You can ask follow‑up questions at any time.'}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Support Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('needMoreHelp') || 'Need more help?'}</h3>
              <p className="text-sm text-gray-600">{t('reachSupport') || 'Reach our support team via phone or email.'}</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <a href="tel:+18001234567" className="flex items-center text-gray-700 hover:text-primary-600">
                <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <Phone className="h-4 w-4 text-primary-600" />
                </span>
                <span className="font-medium">{t('supportPhone') || '+1 (800) 123‑4567'}</span>
              </a>
              <a href="mailto:support@skyreserve.example" className="flex items-center text-gray-700 hover:text-primary-600">
                <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <Mail className="h-4 w-4 text-primary-600" />
                </span>
                <span className="font-medium">{t('supportEmail') || 'support@skyreserve.example'}</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI chatbot */}
      <AIChatbot className="" />
    </div>
  );
}


