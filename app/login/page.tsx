'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Input, Button } from '@/components/Shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email);
    router.push('/dashboard');
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Enter your email to sign in or create an account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email address" 
            type="email" 
            required 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full h-11" isLoading={isSubmitting}>
            Continue with Email
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}