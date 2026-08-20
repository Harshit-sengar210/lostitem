'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, MapPin, Truck, ArrowRight, Smartphone, Wallet, ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Logo SVG component
export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = 'text-brand', size = 48 }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer location pin */}
      <motion.path
        d="M50 15C33.4 15 20 28.4 20 45C20 67.5 50 85 50 85C50 85 80 67.5 80 45C80 28.4 66.6 15 50 15Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      {/* Inner return arrow loop */}
      <motion.path
        d="M50 34C43.9 34 39 38.9 39 45C39 51.1 43.9 56 50 56C56.1 56 61 51.1 61 45"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeInOut' }}
      />
      {/* Arrow head */}
      <motion.path
        d="M57 39L61 45L54 48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.4, type: 'spring' }}
      />
    </svg>
  );
};

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  // Auto-transition from splash to landing after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col justify-between">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center text-white"
          >
            <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
              {/* Logo Animation */}
              <Logo className="text-indigo-500" size={84} />

              {/* Brand Name */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
              >
                FoundBack
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="text-sm tracking-wide text-slate-300 font-medium"
              >
                Lost it? Find it. Get it back.
              </motion.p>

              {/* Loading Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-8 flex items-center justify-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Landing Page Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <Logo className="text-brand" size={36} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">FoundBack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/auth?tab=signup">
            <Button variant="primary" size="sm">Join Platform</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 py-10 lg:py-20 z-10">
        {/* Hero Left Content */}
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left max-w-xl lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center self-center lg:self-start gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4" />
            Delhi NCR Recovery Network
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900"
          >
            Lost something?<br />
            <span className="bg-gradient-to-r from-brand to-indigo-500 bg-clip-text text-transparent">
              Let&apos;s bring it back.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium"
          >
            Find lost items, verify ownership securely, and get them safely delivered right back to your doorstep by verified recovery partners.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-2"
          >
            <Link href="/auth">
              <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/home">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Lost & Found
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200/60 mt-6 max-w-md mx-auto lg:mx-0"
          >
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mb-1">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-800">Secure Claims</span>
              <span className="text-[10px] text-slate-500">Ownership verification</span>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 mb-1">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-800">Local Matches</span>
              <span className="text-[10px] text-slate-500">Ghaziabad & Delhi NCR</span>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <span className="p-2 rounded-xl bg-indigo-50 text-brand mb-1">
                <Truck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-800">Tracked Rider</span>
              <span className="text-[10px] text-slate-500">Doorstep delivery</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Right Visual: Floating Mock Cards */}
        <div className="flex-1 w-full relative h-[420px] max-w-lg lg:max-w-none flex items-center justify-center">
          {/* Decorative background grid and gradients */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-100/50 to-transparent pointer-events-none rounded-full blur-3xl scale-95" />
          
          {/* Animated route route map line simulation */}
          <svg className="absolute w-[80%] h-[80%] text-indigo-100 opacity-60 pointer-events-none" viewBox="0 0 400 400">
            <path
              d="M50 150 C 150 100, 200 300, 350 250"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
            {/* Pulsing delivery marker */}
            <motion.circle
              r="6"
              fill="#4f46e5"
              initial={{ offsetDistance: "0%" }}
              animate={{
                cx: [50, 150, 200, 350],
                cy: [150, 100, 300, 250],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </svg>

          {/* Floating Cards */}
          <div className="w-full relative flex flex-col gap-5 max-w-sm sm:max-w-md">
            
            {/* Card 1: AirPods */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="self-start relative z-10"
            >
              <Card hoverLift className="flex items-center gap-4 bg-white/90 backdrop-blur-sm border border-slate-100/80 shadow-md py-3 px-4 w-[260px] sm:w-[290px]">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Apple AirPods Pro</h4>
                  <p className="text-[10px] text-slate-500">Found near Shipra Mall (1.4 km)</p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600">
                  Found
                </div>
              </Card>
            </motion.div>

            {/* Card 2: Wallet */}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="self-end relative z-20"
            >
              <Card hoverLift className="flex items-center gap-4 bg-white/90 backdrop-blur-sm border border-slate-100/80 shadow-md py-3 px-4 w-[260px] sm:w-[290px]">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Black Leather Wallet</h4>
                  <p className="text-[10px] text-slate-500">Lost near Indirapuram (0.8 km)</p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600">
                  Lost
                </div>
              </Card>
            </motion.div>

            {/* Card 3: Backpack */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="self-center relative z-10"
            >
              <Card hoverLift className="flex items-center gap-4 bg-white/95 backdrop-blur-sm border border-slate-100/80 shadow-md py-3 px-4 w-[260px] sm:w-[290px]">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Blue Backpack</h4>
                  <p className="text-[10px] text-slate-500">Ownership verification pending</p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 animate-pulse">
                  Verifying
                </div>
              </Card>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-200/50 bg-white/50 text-center text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} FoundBack Recovery Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
