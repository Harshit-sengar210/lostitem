'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  Phone,
  MessageSquare,
  CheckCircle,
  Star,
  ShieldCheck,
  Award,
  ArrowLeft,
  X,
  Compass,
  Check,
  Sliders,
  Award as AwardIcon,
  Smile
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Dynamic client import for canvas-confetti
let confetti: any;
if (typeof window !== 'undefined') {
  confetti = require('canvas-confetti');
}

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const { items, activeRecovery, confirmReceived, submitRating, addToast } = useFoundBack();
  
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const item = items.find((i) => i.id === itemId);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Trigger confetti when status becomes delivered
  useEffect(() => {
    if (activeRecovery?.trackingStatus === 'delivered' && confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [activeRecovery?.trackingStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-[420px] bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!item || !activeRecovery) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">No active recovery tracking</h2>
          <p className="text-xs text-slate-500">You must verify ownership and complete payment to track an item.</p>
          <Button onClick={() => router.push('/home')}>Home</Button>
        </div>
      </div>
    );
  }

  // Map coordinates representing the delivery path (curved layout coordinates)
  // start point (item pickup near Shipra Mall) -> end point (user location address)
  const pickupCoords = { x: 30, y: 70 };
  const deliveryCoords = { x: 75, y: 25 };

  const getRiderCoords = () => {
    switch (activeRecovery.trackingStatus) {
      case 'partner_assigned': return { x: 26, y: 74 };
      case 'picked_up': return { x: 30, y: 70 }; // At pickup location
      case 'in_transit': return { x: 48, y: 52 }; // Halfway
      case 'nearby': return { x: 62, y: 38 }; // Close
      case 'arriving': return { x: 71, y: 29 }; // Doorstep
      case 'delivered':
      case 'completed':
        return { x: 75, y: 25 }; // At destination
      default: return { x: 26, y: 74 };
    }
  };

  const riderCoords = getRiderCoords();

  // Status mapping texts
  const getStatusLabel = () => {
    switch (activeRecovery.trackingStatus) {
      case 'partner_assigned': return 'Partner Assigned';
      case 'picked_up': return 'Item Picked Up';
      case 'in_transit': return 'On The Way';
      case 'nearby': return 'Rider Nearby';
      case 'arriving': return 'Arriving Now';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Recovery Completed';
      default: return 'Processing';
    }
  };

  const getStatusDescription = () => {
    switch (activeRecovery.trackingStatus) {
      case 'partner_assigned': return 'Arjun is heading to pick up your item.';
      case 'picked_up': return 'Item has been collected. Starting transit.';
      case 'in_transit': return 'Rider is moving towards your address.';
      case 'nearby': return 'Delivery partner is within 1 km.';
      case 'arriving': return 'Rider is at your doorstep now.';
      case 'delivered': return 'Courier has marked item as delivered. Please confirm.';
      case 'completed': return 'Belonging successfully returned home!';
      default: return 'Coordinating delivery logistics.';
    }
  };

  const handleConfirmReceived = () => {
    confirmReceived();
    setShowConfirmModal(false);
    if (confetti) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingVal === 0) {
      addToast('Please select a star rating.', 'error');
      return;
    }
    submitRating(ratingVal, feedback);
    setReviewSubmitted(true);
  };

  // Timeline list mapping helper
  const timelineStages = [
    { key: 'verification', label: 'Ownership verified', done: true },
    { key: 'payment', label: 'Payment completed', done: true },
    { key: 'assigned', label: 'Partner assigned', done: activeRecovery.partnerStatus === 'assigned' },
    { key: 'picked_up', label: 'Item picked up', done: ['picked_up', 'in_transit', 'nearby', 'arriving', 'delivered', 'completed'].includes(activeRecovery.trackingStatus || '') },
    { key: 'transit', label: 'On the way', done: ['in_transit', 'nearby', 'arriving', 'delivered', 'completed'].includes(activeRecovery.trackingStatus || '') },
    { key: 'arrived', label: 'Delivered', done: ['delivered', 'completed'].includes(activeRecovery.trackingStatus || '') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 text-left">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Diagnostic simulation tools trigger */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none"
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulation Console
          </button>
        </div>

        {/* Debug Diagnostic Panel */}
        <AnimatePresence>
          {showDebug && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-900 border border-indigo-950 text-white rounded-3xl p-5 overflow-hidden text-xs flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <span className="font-extrabold text-[10px] uppercase text-indigo-200 tracking-wider">Demo Control Panel</span>
                <p className="text-[11px] text-indigo-100">
                  The delivery progresses automatically every 8 seconds. Use controls below to force states.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    const statusCycle: any[] = ['partner_assigned', 'picked_up', 'in_transit', 'nearby', 'arriving', 'delivered'];
                    const curIndex = statusCycle.indexOf(activeRecovery.trackingStatus);
                    const nextStatus = statusCycle[(curIndex + 1) % statusCycle.length];
                    
                    // Directly force activeRecovery updater trigger inside provider (mock)
                    // We can achieve this by triggering local mock dispatcher
                    addToast(`Forced state to ${nextStatus}`, 'info');
                  }}
                  className="bg-indigo-800 hover:bg-indigo-750 px-3.5 py-2 rounded-xl font-bold border border-indigo-700 transition-colors"
                >
                  Jump State Stage
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split Grid tracking layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==================================================
              LEFT: LIVE MAP SVG ROAD PREVIEW
              ================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-sm relative h-96 sm:h-[460px] overflow-hidden flex flex-col justify-between">
              
              {/* Map Title Overlay */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-slate-100/60 p-3 rounded-2xl shadow-xs text-xs text-left max-w-[240px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Live Location Map</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{getStatusLabel()}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">{getStatusDescription()}</span>
              </div>

              {/* Animated Map SVG Canvas */}
              <svg className="w-full h-full bg-slate-50 rounded-2xl" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Custom roads network vectors */}
                <path d="M10 70 L90 70" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M30 10 L30 90" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                <path d="M75 10 L75 90" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                
                {/* Curved courier path line */}
                <path
                  d="M 30 70 Q 52 50 75 25"
                  stroke="#4f46e5"
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Pickup Marker (Shipra Mall) */}
                <g transform={`translate(${pickupCoords.x}, ${pickupCoords.y})`}>
                  <circle cx="0" cy="0" r="4" className="fill-indigo-100 stroke-indigo-400 stroke-2" />
                  <circle cx="0" cy="0" r="2.5" className="fill-indigo-600" />
                </g>

                {/* Delivery Destination Marker (Home Address) */}
                <g transform={`translate(${deliveryCoords.x}, ${deliveryCoords.y})`}>
                  <circle cx="0" cy="0" r="6" className="fill-emerald-100 stroke-emerald-400 stroke-2" />
                  <circle cx="0" cy="0" r="3.5" className="fill-emerald-600" />
                  {/* Pulsing ring */}
                  <circle cx="0" cy="0" r="9" className="stroke-emerald-400 stroke-1 fill-none animate-ping opacity-60" />
                </g>

                {/* ANIMATED RIDER COURIER DOT */}
                <motion.g
                  animate={{ x: riderCoords.x, y: riderCoords.y }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                >
                  <circle cx="0" cy="0" r="7.5" className="fill-brand/10 stroke-brand stroke-2" />
                  <circle cx="0" cy="0" r="4.5" className="fill-brand" />
                </motion.g>
              </svg>

              {/* Map Footer indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-500 bg-white/90 backdrop-blur-sm border border-slate-100 p-2.5 rounded-xl shadow-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white" />
                  Pickup Point
                </span>
                <span className="flex items-center gap-1 animate-pulse">
                  <span className="w-2.5 h-2.5 bg-brand rounded-full border border-white" />
                  Arjun Kumar
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  Your Location
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT: DELIVERY TIMELINE & ACTIONS
              ================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Delivery Tracking Details Card */}
            <Card hoverLift={false} className="border border-slate-100 bg-white p-6 shadow-sm">
              <AnimatePresence mode="wait">
                
                {/* CASE A: LIVE DELIVERY TRANSIT CARD */}
                {activeRecovery.trackingStatus !== 'delivered' && activeRecovery.trackingStatus !== 'completed' && (
                  <motion.div
                    key="transit-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Estimated Arrival</span>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeRecovery.eta} mins</h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">Remaining distance: 2.1 km</p>
                      </div>
                      <div className="p-3 bg-indigo-50 text-brand rounded-2xl">
                        <Truck className="w-6 h-6 stroke-[2]" />
                      </div>
                    </div>

                    {/* Rider Card */}
                    <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-left">
                      <div className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-xs">
                        AK
                      </div>
                      <div className="min-w-0 flex-grow">
                        <span className="text-xs font-extrabold text-slate-900 block">Arjun Kumar</span>
                        <span className="text-[9.5px] text-indigo-500 font-extrabold block">UP 14 AB 4821</span>
                        <div className="flex items-center text-amber-500 text-[10px] font-bold mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          4.9 ★ verified courier
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => addToast('Connecting call...', 'info')}
                        className="py-2.5 rounded-xl font-bold text-xs"
                      >
                        <Phone className="w-4 h-4 text-slate-400" />
                        Call Arjun
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => addToast('Opening messages...', 'info')}
                        className="py-2.5 rounded-xl font-bold text-xs"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        Message
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* CASE B: DELIVERED CONFIRMATION PANEL */}
                {activeRecovery.trackingStatus === 'delivered' && (
                  <motion.div
                    key="delivered-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-5 py-4"
                  >
                    <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900">Your item is back!</h3>
                      <p className="text-xs text-slate-500 px-6 leading-relaxed">
                        Arjun has reached your address. Please confirm you have received the item safely.
                      </p>
                    </div>

                    {/* Target Item summary badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                      <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Confirmed Claim</span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      </div>
                    </div>

                    <div className="w-full flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => addToast('Please wait for rider handover.', 'info')}>
                        Not yet
                      </Button>
                      <Button variant="primary" className="flex-1 animate-pulse" onClick={handleConfirmReceived}>
                        Confirm Received
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* CASE C: COMPLETED & RATINGS SHEET */}
                {activeRecovery.trackingStatus === 'completed' && (
                  <motion.div
                    key="completed-ratings"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-5 py-4"
                  >
                    <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <AwardIcon className="w-6 h-6 stroke-[2]" />
                    </div>

                    {!reviewSubmitted ? (
                      <form onSubmit={handleRatingSubmit} className="space-y-5 text-left">
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-extrabold text-slate-900">How was your experience?</h3>
                          <p className="text-xs text-slate-500">Help us keep FoundBack safe and reliable.</p>
                        </div>

                        {/* Star selectors */}
                        <div className="flex justify-center gap-2 my-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingVal(star)}
                              className={`p-1.5 rounded-lg hover:scale-110 transition-transform ${
                                ratingVal >= star ? 'text-amber-500' : 'text-slate-350 hover:text-amber-400'
                              }`}
                            >
                              <Star className="w-7 h-7 fill-current stroke-[1.5]" />
                            </button>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feedback Notes</label>
                          <textarea
                            rows={3}
                            placeholder="Tell us about the verification check, courier speed..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-50"
                          />
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-3.5 rounded-xl font-bold">
                          Submit Review
                        </Button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 pt-2 text-center"
                      >
                        <div className="flex justify-center text-indigo-500">
                          <Smile className="w-10 h-10 animate-bounce" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-950">Thank you!</h4>
                        <p className="text-xs text-slate-500 leading-normal px-4">
                          Thanks for helping us improve FoundBack. Your review logs have been registered.
                        </p>
                        <Button variant="primary" onClick={() => router.push('/home')} className="w-full py-3 rounded-xl mt-2">
                          Back to Home
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </Card>

            {/* Vertical timeline stages (only shown in active transit) */}
            {activeRecovery.trackingStatus !== 'completed' && (
              <Card hoverLift={false} className="border border-slate-100 bg-white p-5 shadow-sm text-left">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Delivery Timeline</h4>
                
                <div className="flex flex-col gap-4 relative pl-5.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-150">
                  {timelineStages.map((st) => (
                    <div
                      key={st.key}
                      className={`relative text-xs flex items-center justify-between font-bold ${
                        st.done ? 'text-slate-800' : 'text-slate-400 font-semibold'
                      }`}
                    >
                      <span className={`absolute -left-6.5 w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-black text-white ${
                        st.done ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        {st.done ? '✓' : ''}
                      </span>
                      {st.label}
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
