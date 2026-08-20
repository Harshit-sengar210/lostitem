'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/app/page';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Search, MapPin, ShieldCheck, Mail, Lock, Phone, User, Globe } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser, addToast } = useFoundBack();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'form' | 'onboarding'>('form');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Role Preference Selection (for sign up onboarding)
  const [selectedRole, setSelectedRole] = useState<'lost' | 'found' | 'both' | null>(null);

  // Sync tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('signin');
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (activeTab === 'signup') {
      if (!name.trim()) newErrors.name = 'Full name is required';
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === 'signin') {
        // Log in immediately
        loginUser(name || 'Arpit Goyal', email, phone || '+91 98765 43210', 'both');
        router.push('/location');
      } else {
        // Go to next onboarding step (What are you looking for?)
        setStep('onboarding');
      }
    }, 1500);
  };

  const handleOnboardingSubmit = () => {
    if (!selectedRole) {
      addToast('Please select an option to continue.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginUser(name, email, phone, selectedRole);
      router.push('/location');
    }, 1200);
  };

  const triggerGoogleLogin = () => {
    setIsLoading(true);
    addToast('Connecting to Google...', 'info');
    setTimeout(() => {
      setIsLoading(false);
      loginUser('Google User', 'user@gmail.com', '+91 99999 88888', 'both');
      router.push('/location');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center gap-2 mb-6">
        <Logo className="text-brand" size={44} />
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          FoundBack
        </h2>
        <p className="text-center text-sm font-medium text-slate-500">
          Your lost item deserves a way home.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card hoverLift={false} className="shadow-xl bg-white/95 backdrop-blur-sm border border-slate-100 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tabs selection */}
                <div className="flex border-b border-slate-100 mb-6 bg-slate-50 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveTab('signin');
                      setErrors({});
                    }}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'signin'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      setErrors({});
                    }}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'signup'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <Input
                        label="Full Name"
                        placeholder="e.g. Arpit Goyal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        leftIcon={<User className="w-4 h-4" />}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={errors.phone}
                        leftIcon={<Phone className="w-4 h-4" />}
                      />
                    </motion.div>
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="arpit@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />

                  {activeTab === 'signup' && (
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  )}

                  {activeTab === 'signin' && (
                    <div className="flex items-center justify-end text-xs font-semibold text-brand hover:underline cursor-pointer select-none">
                      Forgot password?
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={isLoading}
                  >
                    {activeTab === 'signin' ? 'Sign In' : 'Continue'}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-400 font-semibold select-none">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  onClick={triggerGoogleLogin}
                  variant="outline"
                  type="button"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="onboarding-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5 text-center"
              >
                <div className="flex flex-col gap-1 items-center">
                  <div className="p-3 bg-indigo-50 text-brand rounded-2xl mb-1">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">What are you looking for?</h3>
                  <p className="text-xs text-slate-500 max-w-[280px]">
                    Select your primary interest. You can always change this later in your profile.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-2 text-left">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('lost')}
                    className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all text-sm font-semibold select-none ${
                      selectedRole === 'lost'
                        ? 'border-brand bg-indigo-50/40 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 text-brand flex-shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">I lost something</h4>
                      <p className="text-xs text-slate-500 mt-0.5">I want to report and claim items I lost</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('found')}
                    className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all text-sm font-semibold select-none ${
                      selectedRole === 'found'
                        ? 'border-brand bg-indigo-50/40 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 text-brand flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">I found something</h4>
                      <p className="text-xs text-slate-500 mt-0.5">I want to upload items I found to help return them</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('both')}
                    className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all text-sm font-semibold select-none ${
                      selectedRole === 'both'
                        ? 'border-brand bg-indigo-50/40 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 text-brand flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Both</h4>
                      <p className="text-xs text-slate-500 mt-0.5">I lose items and find items frequently</p>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('form')}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleOnboardingSubmit}
                    isLoading={isLoading}
                  >
                    Finish Setup
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
