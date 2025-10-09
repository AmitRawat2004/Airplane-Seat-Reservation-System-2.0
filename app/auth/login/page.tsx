'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Header from '@/components/Header';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
