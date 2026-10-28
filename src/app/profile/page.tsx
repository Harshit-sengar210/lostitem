'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Reusable animated count helper
const StatsCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 600; // ms
    const increment = Math.ceil(end / 10) || 1;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 10);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser } = useFoundBack();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-20 bg-white border border-slate-100 rounded-3xl" />
          <div className="h-64 bg-white border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const displayName = user?.name && user.name.trim() !== '' ? user.name : 'User';
  const trustScore = typeof user?.trustScore === 'number' ? user.trustScore : 80;
  const initialLetters = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const settingsGroups = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, title: 'Personal Information', desc: 'Edit name, email, phone contact details', link: '/profile/personal' },
        { icon: MapPin, title: 'Saved Addresses', desc: 'Manage your courier delivery destinations', link: '/profile/addresses' },
        { icon: CreditCard, title: 'Payment Methods', desc: 'Manage credit cards, UPI accounts', link: '/profile/payments' }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, title: 'Notifications Config', desc: 'Configure matches, updates, promo alerts', link: '/profile/notifications' },
        { icon: Shield, title: 'Privacy & Safety', desc: 'Manage profile and location visibility rules', link: '/profile/privacy' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, title: 'Help Center & FAQ', desc: 'Search documentation and guidelines support', link: '/help' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Profile Card Header */}
        <Card hoverLift={false} className="border border-slate-100 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4.5 text-left self-start sm:self-center">
            <div className="w-16 h-16 bg-brand text-white rounded-3xl flex items-center justify-center font-black text-xl shadow-md shadow-indigo-100">
              {initialLetters}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{displayName}</h2>
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 fill-current text-white" />
              </div>
              <span className="text-xs text-slate-400 font-bold block">{user?.email || 'Authenticated Member'}</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold block mt-1.5 max-w-fit uppercase">
                Active Member
              </span>
            </div>
          </div>

          {/* SVG Score Gauge Circle */}
          <div className="flex items-center gap-3.5 flex-shrink-0 self-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full text-slate-100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6.5" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#4f46e5"
                  strokeWidth="6.5"
                  fill="none"
                  strokeDasharray="250"
                  initial={{ strokeDashoffset: 250 }}
                  animate={{ strokeDashoffset: 250 - (250 * trustScore) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute text-slate-900 font-black text-sm">{trustScore}%</div>
            </div>
            <div className="text-left leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Trust Score</span>
              <span className="text-xs font-extrabold text-slate-800">
                {trustScore >= 80 ? 'Verified Integrity' : 'Standard Member'}
              </span>
            </div>
          </div>
        </Card>

        {/* Profile Statistics counts - REAL LIVE COUNTS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100/80 p-4 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Lost Reports</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-1 leading-none">
              <StatsCounter value={user?.itemsLost ?? 0} />
            </span>
          </div>
          <div className="bg-white border border-slate-100/80 p-4 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Found Reports</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-1 leading-none">
              <StatsCounter value={user?.itemsFound ?? 0} />
            </span>
          </div>
          <div className="bg-white border border-slate-100/80 p-4 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Recoveries Done</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-1 leading-none">
              <StatsCounter value={user?.itemsRecovered ?? 0} />
            </span>
          </div>
          <div className="bg-white border border-slate-100/80 p-4 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Items Returned</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-1 leading-none">
              <StatsCounter value={user?.itemsReturned ?? 0} />
            </span>
          </div>
        </div>

        {/* Community Trust meter explanation */}
        <Card hoverLift={false} className="border-slate-100 bg-white p-5 shadow-xs text-left">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-grow">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Community Trust Score</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Your trust score reflects successful reports, verified recoveries, confirmed deliveries, and positive community ratings.
              </p>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trustScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-brand h-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Links Groups */}
        <div className="space-y-6">
          {settingsGroups.map((gp, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{gp.title}</h3>
              <Card hoverLift={false} className="border border-slate-100 bg-white p-0 overflow-hidden divide-y divide-slate-50 shadow-sm">
                {gp.items.map((it, iIdx) => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={iIdx}
                      onClick={() => router.push(it.link)}
                      className="w-full py-4.5 px-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-4 min-w-0 pr-6">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 block leading-tight">{it.title}</span>
                          <span className="text-[10px] text-slate-450 mt-1 block truncate leading-none">{it.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-350 flex-shrink-0" />
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>

        {/* Logout action */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full py-4 border rounded-2xl font-bold flex items-center justify-center gap-2 text-red-500 border-red-100 hover:bg-red-50/40"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log Out Account
        </Button>

      </main>
    </div>
  );
}
