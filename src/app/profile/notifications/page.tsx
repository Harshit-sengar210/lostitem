'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Settings, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ToggleItem {
  key: string;
  title: string;
  description: string;
}

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const { addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // Toggle states
  const [settings, setSettings] = useState<{ [key: string]: boolean }>({
    recoveryUpdates: true,
    matchingItems: true,
    deliveryUpdates: true,
    communityAlerts: false,
    promoAlerts: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_profile_notifications_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (key: string) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('fb_profile_notifications_settings', JSON.stringify(updated));
      return updated;
    });
    addToast('Preferences saved', 'success');
  };

  const toggleItems: ToggleItem[] = [
    { key: 'recoveryUpdates', title: 'Recovery Updates', description: 'Instant alerts on ownership verification results and claims requests.' },
    { key: 'matchingItems', title: 'New Matching Items', description: 'Receive matches when other users report items corresponding to your description.' },
    { key: 'deliveryUpdates', title: 'Delivery Updates', description: 'Real-time rider courier GPS stage notifications (picked up, transit, arriving).' },
    { key: 'communityAlerts', title: 'Community Notifications', description: 'Important safe recovery guidelines and neighborhood news alerts.' },
    { key: 'promoAlerts', title: 'Promotional Notifications', description: 'Platform announcements, safety reward programs, and discounts.' }
  ];

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

        {/* Settings Card */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-1.5 mb-6 border-b border-slate-50 pb-5">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Preferences Configuration</span>
            <h2 className="text-xl font-extrabold text-slate-900">Notification Settings</h2>
            <p className="text-xs text-slate-500">Configure alert notifications and real-time matcher updates.</p>
          </div>

          <div className="space-y-5">
            {toggleItems.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-6 pb-4 border-b border-slate-50/60 last:border-b-0 last:pb-0">
                <div className="text-left space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">{item.title}</span>
                  <p className="text-[10.5px] text-slate-500 leading-normal font-medium">{item.description}</p>
                </div>

                {/* ANIMATED PILL SWITCH */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center focus:outline-none flex-shrink-0 cursor-pointer ${
                    settings[item.key] ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-4.5 h-4.5 bg-white rounded-full shadow-sm"
                    animate={{ x: settings[item.key] ? 18 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 flex gap-4 border-t border-slate-50 mt-8">
            <Button
              type="button"
              variant="primary"
              className="w-full py-3.5 rounded-xl font-bold"
              onClick={() => router.push('/profile')}
            >
              Done Settings
            </Button>
          </div>
        </Card>

      </main>
    </div>
  );
}
