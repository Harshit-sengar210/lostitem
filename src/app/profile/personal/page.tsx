'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Lock, Save } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PersonalInfoPage() {
  const router = useRouter();
  const { user, loginUser, addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-80 bg-white border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate saving (1 second)
    setTimeout(() => {
      // Re-login / update user context with new values
      loginUser(name, email, phone, user?.targetRole || 'both');
      setIsSaving(false);
      addToast('Profile updated successfully.', 'success');
      router.push('/profile');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push('/profile')}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Form container */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-1.5 mb-6">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Account Information</span>
            <h2 className="text-xl font-extrabold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update your public name and verified contact details.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Harshit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. harshit@foundback.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div className="pt-4 flex gap-4.5 border-t border-slate-50 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isSaving}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

      </main>
    </div>
  );
}
