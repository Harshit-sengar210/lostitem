'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Flag,
  ArrowLeft,
  Compass,
  Star,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Clock,
  MapPinCheckInside
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ItemDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const { items, startClaim, addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const item = items.find((i) => i.id === itemId);

  // Initialize saved state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && item) {
      const savedItems = localStorage.getItem('fb_saved_items');
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        setIsSaved(parsed.includes(item.id));
      }
    }
  }, [item]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

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
          <Button variant="primary" onClick={() => router.push('/home')}>
            Return to Homepage
          </Button>
        </main>
      </div>
    );
  }

  // Generate 3 alternate views using random crop sigs to mock a multi-photo gallery
  const galleryImages = [
    item.image,
    item.image.startsWith('http') ? `${item.image}&sig=1` : item.image,
    item.image.startsWith('http') ? `${item.image}&sig=2` : item.image,
    item.image.startsWith('http') ? `${item.image}&sig=3` : item.image,
  ];

  const handleSaveToggle = () => {
    if (typeof window !== 'undefined') {
      const savedItems = localStorage.getItem('fb_saved_items');
      let parsed: string[] = savedItems ? JSON.parse(savedItems) : [];
      
      if (isSaved) {
        parsed = parsed.filter((id) => id !== item.id);
        setIsSaved(false);
        addToast('Removed from saved list', 'info');
      } else {
        parsed.push(item.id);
        setIsSaved(true);
        addToast('Item saved', 'success');
      }
      localStorage.setItem('fb_saved_items', JSON.stringify(parsed));
    }
  };

  const handleStartClaim = () => {
    startClaim(item.id);
    setShowClaimModal(false);
    router.push(`/claim/${item.id}`);
  };

  const prevImage = () => {
    setSelectedImgIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImgIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==================================================
              LEFT COLUMN: IMAGE GALLERY
              ================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            {/* Main Stage Image */}
            <div className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-xs group">
              <motion.img
                key={selectedImgIdx}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 1 }}
                src={galleryImages[selectedImgIdx]}
                alt={`${item.name} alternate view`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 cursor-zoom-in"
                onClick={() => setIsFullscreen(true)}
              />

              {/* Float navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-100 rounded-full shadow-md text-slate-700 hover:text-slate-900 transition-all focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-100 rounded-full shadow-md text-slate-700 hover:text-slate-900 transition-all focus:outline-none"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Counters and Zoom shortcuts */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                {selectedImgIdx + 1} / {galleryImages.length}
              </div>
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/85 backdrop-blur-sm text-white p-2 rounded-lg transition-colors focus:outline-none"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 select-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all bg-white ${
                    selectedImgIdx === idx ? 'border-brand ring-2 ring-indigo-50' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="thumbnail thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Description Text */}
            <div className="flex flex-col gap-3.5 mt-4">
              <h3 className="text-base font-extrabold text-slate-900">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>
              
              <div className="flex gap-2.5 p-3.5 bg-amber-50/15 border border-amber-100/60 rounded-2xl text-[11px] text-slate-600 leading-normal max-w-xl">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-slate-900 block mb-0.5">Privacy Notice</span>
                  Some identifying details are intentionally hidden to protect the rightful owner.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT COLUMN: META INFO & STATUS
              ================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Meta Info Panel */}
            <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                  {item.status}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2.5 leading-tight">{item.name}</h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                  Category: {item.category}
                </span>
              </div>

              {/* Technical specs block */}
              <div className="flex flex-col gap-3.5 pt-4.5 border-t border-slate-50 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">Found Location</span>
                    <span className="text-[11px] text-slate-500">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">Date Found</span>
                    <span className="text-[11px] text-slate-500">{item.date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Compass className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">Estimated distance</span>
                    <span className="text-[11px] text-slate-500">{item.distance} km away from your coordinates</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-50 mt-1">
                  <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">Verification Integrity</span>
                    <span className="text-[11px] text-slate-500">Posted by a verified community member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Status Card */}
            <Card hoverLift={false} className="border-slate-100 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Verification Pipeline</h4>
              
              <div className="flex flex-col gap-4 relative pl-5.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                
                <div className="relative text-xs flex items-center justify-between text-slate-800 font-bold">
                  <span className="absolute -left-6.5 w-4 h-4 bg-emerald-500 border border-emerald-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                  Report submitted
                </div>

                <div className="relative text-xs flex items-center justify-between text-slate-800 font-bold">
                  <span className="absolute -left-6.5 w-4 h-4 bg-emerald-500 border border-emerald-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                  Location verified
                </div>

                <div className="relative text-xs flex items-center justify-between text-slate-500 font-semibold">
                  <span className="absolute -left-6.5 w-4 h-4 bg-indigo-50 border-2 border-brand rounded-full map-pulse flex items-center justify-center" />
                  Waiting for rightful owner
                </div>

              </div>
            </Card>

            {/* Claims Checkout Actions Card */}
            <Card hoverLift={false} className="border-indigo-100 bg-indigo-50/20 flex flex-col gap-4 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col gap-1 text-slate-700">
                <h4 className="text-sm font-extrabold text-slate-950">Claim this property</h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  To keep the network secure, you must complete verification questions to confirm ownership.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <Button
                  variant="primary"
                  className="flex-grow py-3 rounded-xl font-bold"
                  onClick={() => setShowClaimModal(true)}
                >
                  Claim This Item
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSaveToggle}
                  className={`py-3 px-4 border rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                    isSaved ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-600 border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                  {isSaved ? 'Saved ✓' : 'Save Item'}
                </Button>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors pt-2 select-none"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Incorrect Listing
              </button>
            </Card>

          </div>

        </div>
      </main>

      {/* ==================================================
          FULLSCREEN GALLERY SLIDESHOW MODAL OVERLAY
          ================================================== */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-xs select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Slider frame */}
            <div className="relative max-w-4xl w-full h-[70vh] flex items-center justify-center">
              <img
                src={galleryImages[selectedImgIdx]}
                alt="fullscreen preview"
                className="max-w-full max-h-full object-contain rounded-2xl"
              />

              {/* Overlay Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full focus:outline-none"
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full focus:outline-none"
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Thumbnails shortcut bar */}
            <div className="flex gap-2.5 mt-6">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImgIdx === idx ? 'border-brand opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-85'
                  }`}
                >
                  <img src={img} alt="fullscreen thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================
          CLAIM MODAL OVERLAY (START VERIFICATION)
          ================================================== */}
      <AnimatePresence>
        {showClaimModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            />
            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[22%] mx-auto max-w-sm bg-white rounded-3xl p-6 z-50 border border-slate-100 shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 bg-indigo-50 text-brand rounded-full flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6 text-brand stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Is this your item?</h3>
                <p className="text-xs text-slate-500 leading-normal px-2">
                  To protect everyone involved, FoundBack verifies ownership before an item can be claimed.
                </p>
              </div>

              {/* Item Card Details summary */}
              <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <Button
                  variant="primary"
                  onClick={handleStartClaim}
                  className="w-full py-3 rounded-xl font-bold"
                >
                  Start Verification
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowClaimModal(false)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
