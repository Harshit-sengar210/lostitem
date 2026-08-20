'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, MapPin, EyeOff, Info, HelpCircle } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // States
  const [profileVisibility, setProfileVisibility] = useState('verified');
  const [shareLocation, setShareLocation] = useState(true);
  const [contactVisibility, setContactVisibility] = useState('challenge');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_profile_privacy_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfileVisibility(parsed.profileVisibility);
        setShareLocation(parsed.shareLocation);
        setContactVisibility(parsed.contactVisibility);
        setShowStats(parsed.showStats);
      }
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      const settings = {
        profileVisibility,
        shareLocation,
        contactVisibility,
        showStats
      };
      localStorage.setItem('fb_profile_privacy_settings', JSON.stringify(settings));
    }
    addToast('Privacy preferences updated', 'success');
    router.push('/profile');
  };

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

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/profile')}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Privacy Card */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-1.5 mb-6 border-b border-slate-50 pb-5">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Privacy & Safety</span>
            <h2 className="text-xl font-extrabold text-slate-900">Privacy Settings</h2>
            <p className="text-xs text-slate-500">Configure profile visibility and coordinate sharing protocols.</p>
          </div>

          <div className="space-y-6">
            
            {/* 1. Profile visibility dropdown */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  Profile visibility
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Security info</span>
              </div>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none focus:border-brand shadow-xs"
              >
                <option value="public">Public (Anyone can view reports)</option>
                <option value="verified">Verified Members Only (Recommended)</option>
                <option value="private">Private (Only you and admin partners)</option>
              </select>
              <span className="text-[10px] text-slate-400 leading-normal pl-0.5">
                Restricting profile search view prevents bot scanners from reading your lost listing coordinates.
              </span>
            </div>

            {/* 2. Location sharing toggle */}
            <div className="flex items-start justify-between gap-6 pt-4 border-t border-slate-50/60">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Approximate Location Sharing
                </span>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  Show generalized area zones (e.g. Indirapuram) instead of exact GPS markers to public finder boards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareLocation(!shareLocation)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center focus:outline-none flex-shrink-0 cursor-pointer ${
                  shareLocation ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <motion.div
                  layout
                  className="w-4.5 h-4.5 bg-white rounded-full shadow-sm"
                  animate={{ x: shareLocation ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* 3. Contact visibility dropdown */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-50/60">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-slate-400" />
                Contact Information Visibility
              </span>
              <select
                value={contactVisibility}
                onChange={(e) => setContactVisibility(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none focus:border-brand shadow-xs"
              >
                <option value="direct">Allow verified direct phone calls</option>
                <option value="challenge">Require ownership verification check first (Recommended)</option>
                <option value="hide">Hide contact details completely</option>
              </select>
              <span className="text-[10px] text-slate-400 leading-normal pl-0.5">
                Direct phone number visibility will be locked until you approve the claim matching.
              </span>
            </div>

            {/* 4. Stats visibility toggle */}
            <div className="flex items-start justify-between gap-6 pt-4 border-t border-slate-50/60">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Show completed stats in profile
                </span>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  Expose count sums (e.g. 6 items recovered) to establish reliability on the community network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStats(!showStats)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center focus:outline-none flex-shrink-0 cursor-pointer ${
                  showStats ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <motion.div
                  layout
                  className="w-4.5 h-4.5 bg-white rounded-full shadow-sm"
                  animate={{ x: showStats ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

          </div>

          {/* Alert Security Notice */}
          <div className="bg-indigo-50/20 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-xs text-slate-650 mt-6">
            <Info className="w-5 h-5 text-indigo-650 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Security Shield Active</span>
              <p className="text-[11px] leading-normal text-slate-500 mt-0.5">
                FoundBack never shares sensitive verification answers publicly. All claims data undergoes encrypted review.
              </p>
            </div>
          </div>

          <div className="pt-6 flex gap-4 border-t border-slate-50 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-grow py-3.5"
              onClick={() => router.push('/profile')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-grow py-3.5"
              onClick={handleSave}
            >
              Save Preferences
            </Button>
          </div>
        </Card>

      </main>
    </div>
  );
}
