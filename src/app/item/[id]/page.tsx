'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  ArrowLeft,
  Star,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/backend/firebase';
import { Item } from '@/data/mockItems';

export default function ItemDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const { items, startClaim, addToast } = useFoundBack();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // 1. First check in global state
  // 2. If not found (e.g. freshly created report opened directly), fetch live from Firestore
  useEffect(() => {
    const existing = items.find((i) => i.id === itemId);
    if (existing) {
      setItem(existing);
      setLoading(false);
    } else if (itemId) {
      getDoc(doc(db, 'items', itemId))
        .then((snap) => {
          if (snap.exists()) {
            setItem({ id: snap.id, ...snap.data() } as Item);
          }
        })
        .catch(console.warn)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [items, itemId]);

  // Saved items check
  useEffect(() => {
    if (typeof window !== 'undefined' && item) {
      const savedItems = localStorage.getItem('fb_saved_items');
      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems);
          setIsSaved(parsed.includes(item.id));
        } catch {
          setIsSaved(false);
        }
      }
    }
  }, [item]);

  const toggleSave = () => {
    if (!item) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fb_saved_items');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (nextSaved) {
        list.push(item.id);
        addToast('Saved to your favorites', 'success');
      } else {
        list = list.filter((id) => id !== item.id);
        addToast('Removed from favorites', 'info');
      }
      localStorage.setItem('fb_saved_items', JSON.stringify(list));
    }
  };

  const handleStartClaim = () => {
    if (!item) return;
    setShowClaimModal(false);
    startClaim(item.id);
    router.push(`/claim/${item.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-80 bg-slate-200 rounded-3xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 w-2/3 bg-slate-200 rounded-lg" />
              <div className="h-4 w-1/3 bg-slate-200 rounded-lg" />
              <div className="h-32 bg-slate-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-md mx-auto py-24 px-6 text-center flex flex-col items-center gap-4">
          <div className="p-4 bg-red-50 text-red-500 rounded-full">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Listing Not Found</h2>
          <p className="text-xs text-slate-400">This report may have been deleted or does not exist.</p>
          <Button variant="primary" onClick={() => router.push('/home')}>
            Return to Homepage
          </Button>
        </main>
      </div>
    );
  }

  const galleryImages = [item.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12 text-left">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Navigation Bar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSave}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
              }`}
              title="Save item"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[selectedImgIdx] || item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />

              {/* Status Badge Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                  item.status === 'FOUND'
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-indigo-600/90 text-white'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Details Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {item.category}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {item.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                <span>{item.location}</span>
              </div>
            </div>

            {/* Finder / Reporter Profile Card */}
            <Card hoverLift={false} className="border-slate-100 bg-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-brand font-bold text-sm flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.finderName || 'Community Member'}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{item.finderRating || 5.0} Rating</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </Card>

            {/* Description Card */}
            <Card hoverLift={false} className="border-slate-100 bg-white p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Item Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Reported on: {item.date}</span>
              </div>
            </Card>

            {/* Action Claim Button */}
            {item.status === 'FOUND' && (
              <Button
                variant="primary"
                onClick={() => setShowClaimModal(true)}
                className="w-full py-4 text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100"
              >
                Claim This Item
              </Button>
            )}

            {item.status === 'LOST' && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center">
                <span className="text-xs font-bold text-indigo-950 block">Active Search In Progress</span>
                <p className="text-[11px] text-indigo-600 mt-0.5">
                  Our Delhi NCR finder network is searching for matching reports.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Claim Modal Overlay */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-indigo-50 text-brand rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Verify Ownership</h3>
                <p className="text-xs text-slate-500">
                  To protect items, you will answer quick verification details (colors, unique marks) before courier dispatch.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="primary" onClick={handleStartClaim}>
                  Start Verification
                </Button>
                <Button variant="outline" onClick={() => setShowClaimModal(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
