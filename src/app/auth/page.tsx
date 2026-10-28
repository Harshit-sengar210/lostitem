'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/app/page';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Search, MapPin, ShieldCheck, Mail, Lock, Phone, User, Globe, AlertCircle, CheckCircle } from 'lucide-react';

// Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/backend/firebase';

// ─── helpers ────────────────────────────────────────────────
async function ensureUserDoc(
  uid: string,
  name: string,
  email: string,
  phone: string,
  role: 'lost' | 'found' | 'both'
) {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        name,
        email,
        phone,
        trustScore: 80,
        targetRole: role,
        itemsLost: 0,
        itemsFound: 0,
        itemsRecovered: 0,
        itemsReturned: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Firestore user profile sync error (check Firestore rules/permissions):', err);
  }
}

// ─── Main Auth Component ─────────────────────────────────────
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loginUser, addToast } = useFoundBack();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'form' | 'onboarding'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [firebaseError, setFirebaseError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState<'lost' | 'found' | 'both' | null>(null);
  // Store the firebase user temporarily between signup form → onboarding step
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    setActiveTab(tabParam === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);

  // If already logged in, redirect user to home
  useEffect(() => {
    if (user?.isLoggedIn && step !== 'onboarding') {
      router.push('/home');
    }
  }, [user, step, router]);

  // ─── Validation ─────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (activeTab === 'signup') {
      if (!name.trim()) newErrors.name = 'Full name is required';
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number (e.g. +91 9876543210)';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
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

  // ─── Human-readable Firebase errors ─────────────────────────
  const friendlyError = (err: any) => {
    const code = err?.code || '';
    const message = err?.message || '';

    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please click "Create Account" above to register first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password, or this account does not exist yet. If you have not created an account, click "Create Account".';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please switch to "Sign In".';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment or reset your password.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      case 'auth/operation-not-allowed':
        return 'Sign-in method is not enabled in Firebase Console. Go to Authentication > Sign-in method in Firebase and enable Email/Password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email format (e.g. you@example.com).';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      default:
        return message || 'Authentication failed. Please verify your details or create an account first.';
    }
  };

  // ─── Forgot Password ─────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFirebaseError('Please enter your email address above first to reset password.');
      return;
    }
    setFirebaseError('');
    setResetSuccessMessage('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccessMessage('Password reset link has been sent to your email.');
      addToast('Password reset link sent to your email.', 'info');
    } catch (err: any) {
      setFirebaseError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Email / Password submit ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFirebaseError('');
    setResetSuccessMessage('');

    try {
      if (activeTab === 'signin') {
        // ── Sign in ──────────────────────────────────────────
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

        // Pull profile from Firestore if available
        let profile = null;
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            profile = snap.data();
          }
        } catch {
          // non-blocking
        }

        loginUser(
          profile?.name ?? user.displayName ?? 'User',
          user.email ?? email.trim(),
          profile?.phone ?? '',
          profile?.targetRole ?? 'both'
        );
        addToast('Welcome back! 👋', 'success');
        router.push('/home');
      } else {
        // ── Sign up — step 1: create Firebase account ────────
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        try {
          await updateProfile(user, { displayName: name.trim() });
        } catch {
          // ignore
        }
        setPendingUid(user.uid);
        setStep('onboarding'); // go to role selection
      }
    } catch (err: any) {
      setFirebaseError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Onboarding role submit ──────────────────────────────────
  const handleOnboardingSubmit = async () => {
    if (!selectedRole) {
      addToast('Please select an option to continue.', 'error');
      return;
    }
    if (!pendingUid) {
      addToast('Session expired. Please sign up again.', 'error');
      setStep('form');
      return;
    }

    setIsLoading(true);
    setFirebaseError('');
    try {
      // Create Firestore user profile
      await ensureUserDoc(pendingUid, name.trim(), email.trim(), phone.trim(), selectedRole);

      // Update local app state
      loginUser(name.trim(), email.trim(), phone.trim(), selectedRole);
      addToast('Account created! Welcome to FoundBack 🎉', 'success');
      router.push('/location');
    } catch (err: any) {
      setFirebaseError('Account created, continuing setup...');
      loginUser(name.trim(), email.trim(), phone.trim(), selectedRole);
      router.push('/location');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In ──────────────────────────────────────────
  const triggerGoogleLogin = async () => {
    setIsLoading(true);
    setFirebaseError('');
    setResetSuccessMessage('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const { user } = await signInWithPopup(auth, provider);

      // Ensure Firestore document exists
      await ensureUserDoc(
        user.uid,
        user.displayName ?? 'User',
        user.email ?? '',
        '',
        'both'
      );

      let profile = null;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          profile = snap.data();
        }
      } catch {
        // non-blocking
      }

      loginUser(
        profile?.name ?? user.displayName ?? 'User',
        user.email ?? '',
        profile?.phone ?? '',
        profile?.targetRole ?? 'both'
      );
      addToast('Signed in with Google! 🎉', 'success');
      router.push('/home');
    } catch (err: any) {
      setFirebaseError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center gap-2 mb-6">
        <Logo className="text-brand cursor-pointer" size={44} />
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">FoundBack</h2>
        <p className="text-center text-sm font-medium text-slate-500">Your lost item deserves a way home.</p>
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
                {/* Tab switcher */}
                <div className="flex border-b border-slate-100 mb-6 bg-slate-50 p-1 rounded-xl">
                  {(['signin', 'signup'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setErrors({}); setFirebaseError(''); setResetSuccessMessage(''); }}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                        activeTab === tab
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                {/* Firebase error banner */}
                {firebaseError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium leading-relaxed">{firebaseError}</p>
                  </motion.div>
                )}

                {/* Reset Success banner */}
                {resetSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-emerald-600 font-medium">{resetSuccessMessage}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                      <Input
                        label="Full Name"
                        placeholder="e.g. Harshit Sengar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        leftIcon={<User className="w-4 h-4" />}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +91 9876543210"
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
                    placeholder="you@example.com"
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
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-semibold text-brand hover:underline cursor-pointer select-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
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

                {/* Google */}
                <Button onClick={triggerGoogleLogin} variant="outline" type="button" className="w-full flex items-center justify-center gap-2" isLoading={isLoading}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google
                </Button>
              </motion.div>

            ) : (
              /* ── Onboarding: role selection ────────────────────── */
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
                    Select your primary interest. You can always change this later.
                  </p>
                </div>

                {firebaseError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{firebaseError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-2 text-left">
                  {([
                    { role: 'lost' as const, icon: <Search className="w-4 h-4" />, title: 'I lost something', desc: 'I want to report and claim items I lost' },
                    { role: 'found' as const, icon: <MapPin className="w-4 h-4" />, title: 'I found something', desc: 'I want to upload items I found to help return them' },
                    { role: 'both' as const, icon: <ShieldCheck className="w-4 h-4" />, title: 'Both', desc: 'I lose items and find items frequently' },
                  ]).map(({ role, icon, title, desc }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all text-sm font-semibold select-none ${
                        selectedRole === role
                          ? 'border-brand bg-indigo-50/40 ring-2 ring-indigo-100'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 text-brand flex-shrink-0">{icon}</div>
                      <div>
                        <h4 className="font-bold text-slate-900">{title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Back</Button>
                  <Button variant="primary" className="flex-1" onClick={handleOnboardingSubmit} isLoading={isLoading}>
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
