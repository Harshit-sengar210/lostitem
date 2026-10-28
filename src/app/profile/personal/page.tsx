'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Save } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/backend/firebase';

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
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    const timer = setTimeout(() => setLoading(false), 200);
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

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update Firebase Auth Display Name
        if (name.trim()) {
          await updateProfile(currentUser, { displayName: name.trim() });
        }

        // Update Firestore Document
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userRef,
          {
            name: name.trim(),
            phone: phone.trim(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }

      // Update Local App State
      loginUser(name.trim(), email.trim(), phone.trim(), user?.targetRole || 'both');
      addToast('Profile updated live in Firestore! 🎉', 'success');
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Could not update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
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
              placeholder="e.g. Harshit Sengar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              disabled
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
