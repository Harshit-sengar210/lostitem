'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { auth } from '@/backend/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const ADMIN_PRIMARY_UID = 'k7AgEIzGQHbBxnekS26POn4602x2';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if current authenticated user already has Admin UID
  useEffect(() => {
    if (auth.currentUser && auth.currentUser.uid === ADMIN_PRIMARY_UID) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('fb_admin_auth', 'true');
        sessionStorage.setItem('fb_admin_uid', auth.currentUser.uid);
      }
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = emailOrUser.trim().toLowerCase();

    // 1. Check if user is signing in via Firebase Email/Password
    if (identifier.includes('@')) {
      try {
        const cred = await signInWithEmailAndPassword(auth, identifier, password);
        if (cred.user.uid === ADMIN_PRIMARY_UID) {
          sessionStorage.setItem('fb_admin_auth', 'true');
          sessionStorage.setItem('fb_admin_uid', cred.user.uid);
          router.push('/admin/dashboard');
          return;
        } else {
          setError(`Access denied. UID (${cred.user.uid.slice(0, 8)}...) is not authorized as Admin.`);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Firebase admin sign-in attempt failed, checking fallback credentials:', err?.code);
      }
    }

    // 2. Direct Admin root login verification
    if ((identifier === 'admin' || identifier === 'admin@foundback.com') && password === 'admin123') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('fb_admin_auth', 'true');
        sessionStorage.setItem('fb_admin_uid', ADMIN_PRIMARY_UID);
      }
      router.push('/admin/dashboard');
      return;
    }

    setError('Invalid Admin credentials or unauthorized UID. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-left">
      {/* Background glowing meshes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar back link */}
      <div className="max-w-md w-full mx-auto z-10">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FoundBack Website
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Portal</h2>
          <p className="text-xs font-medium text-slate-400">
            Internal Operations, Dispatch & Verification Suite
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email or Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="admin or your admin email"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              isLoading={isLoading}
            >
              Verify & Enter Console
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin UID: <strong className="text-slate-300">k7AgEIzGQHbBxnekS26POn4602x2</strong></span>
            </div>
            <p className="text-[10px] text-slate-500">
              Direct Access: username <strong className="text-slate-300">admin</strong> &bull; password <strong className="text-slate-300">admin123</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 z-10">
        FoundBack SuperAdmin Suite &bull; Realtime Cloud Firestore Engine
      </div>
    </div>
  );
}
