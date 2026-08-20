'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Navigation as CompassIcon, Star, Phone, MessageSquare, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DeliveryPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const { items, activeRecovery, addToast } = useFoundBack();
  const [searching, setSearching] = useState(true);

  const item = items.find((i) => i.id === itemId);

  // Simulate Radar scanning to find a partner (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearching(false);
      addToast('Delivery partner assigned successfully!', 'success');
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Auto transition to live tracking page after 4 seconds of showing the found partner
  useEffect(() => {
    if (!searching) {
      const timeout = setTimeout(() => {
        router.push(`/tracking/${itemId}`);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [searching, itemId, router]);

  if (!item || !activeRecovery) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">Recovery data not found</h2>
          <Button onClick={() => router.push('/home')}>Home</Button>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    addToast('Calling Arjun Kumar (+91 98765 43210)...', 'info');
  };

  const handleMessage = () => {
    addToast('Chat simulator starting...', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Main Card */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white overflow-hidden p-0 flex flex-col justify-between min-h-[460px]">
          
          <AnimatePresence mode="wait">
            {searching ? (
              /* ==================================================
                 STATE 1: SCANNING RADAR AREA
                 ================================================== */
              <motion.div
                key="searching-radar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-8 flex-grow flex flex-col justify-between items-center text-center"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Search in progress</span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Finding a delivery partner</h2>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Assigning a verified courier rider near <span className="font-bold text-slate-950">{item.location.split(',')[0]}</span> to retrieve your item.
                  </p>
                </div>

                {/* Animated Radar Pulse circles */}
                <div className="relative w-48 h-48 flex items-center justify-center bg-indigo-50/20 border border-slate-100 rounded-full my-6 overflow-hidden">
                  
                  {/* Pulse 1 */}
                  <motion.div
                    initial={{ scale: 0.1, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 border-2 border-indigo-400 rounded-full"
                  />

                  {/* Pulse 2 */}
                  <motion.div
                    initial={{ scale: 0.1, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 border-2 border-indigo-400 rounded-full"
                  />

                  {/* Scanner sweep line */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent to-indigo-500 origin-left left-1/2 top-1/2 z-10"
                  />

                  {/* Floating rider dots */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-10 left-12 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-md"
                  />
                  <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute bottom-12 right-14 w-2.5 h-2.5 bg-brand rounded-full shadow-md"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-28 right-8 w-2 h-2 bg-emerald-500 rounded-full shadow-md"
                  />

                  {/* Central location marker */}
                  <div className="z-10 p-3 bg-brand text-white rounded-2xl shadow-lg border border-indigo-400 animate-pulse">
                    <CompassIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  Pulsing nearby riders...
                </div>
              </motion.div>
            ) : (
              /* ==================================================
                 STATE 2: PARTNER FOUND RIDER DETAILS CARD
                 ================================================== */
              <motion.div
                key="partner-found"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col justify-between"
              >
                {/* Header confirmation */}
                <div className="p-6 sm:p-8 text-center space-y-1.5 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-2.5">Delivery partner found!</h2>
                  <p className="text-xs text-slate-500">
                    Rider has accepted recovery. Estimated pickup: <span className="font-bold text-slate-900">6 mins</span>
                  </p>
                </div>

                {/* Arjun Kumar profile specs details */}
                <div className="p-6 sm:p-8 flex-grow space-y-5 text-left">
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100/50 rounded-2xl p-4.5">
                    {/* Avatar initials badge */}
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-base font-extrabold shadow-sm flex-shrink-0">
                      AK
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">Arjun Kumar</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500 fill-current text-white" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block">Verified Delivery Partner</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-amber-500 text-[10px] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          4.9
                        </div>
                        <span className="text-slate-300 text-[10px]">&bull;</span>
                        <span className="text-slate-400 text-[10px] font-bold">428 Deliveries</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle plates details */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Vehicle Type</span>
                      <span className="font-bold text-slate-900">Honda Activa (Electric)</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">License Plate</span>
                      <span className="font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded-md inline-block max-w-fit">
                        UP 14 AB 4821
                      </span>
                    </div>
                  </div>

                  {/* Delivery ETA summary details */}
                  <div className="bg-indigo-50/10 border border-indigo-100/50 rounded-2xl p-4.5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4.5 h-4.5 text-brand" />
                      <div>
                        <span className="font-semibold text-slate-500 block">Deliver to Address</span>
                        <span className="font-bold text-slate-800 truncate block max-w-[200px]">
                          {activeRecovery.deliveryAddress?.address}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-500 block">Estimated Arrival</span>
                      <span className="font-extrabold text-brand text-sm">24 minutes</span>
                    </div>
                  </div>

                  {/* Call & Chat shortcuts buttons */}
                  <div className="grid grid-cols-2 gap-3.5 mt-2">
                    <Button
                      variant="outline"
                      onClick={handleCall}
                      className="py-3 px-4 border rounded-xl font-bold flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Phone className="w-4 h-4 text-slate-500" />
                      Call Arjun
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMessage}
                      className="py-3 px-4 border rounded-xl font-bold flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      Message chat
                    </Button>
                  </div>
                </div>

                {/* Footer action trigger */}
                <div className="p-6 border-t border-slate-50 text-center">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/tracking/${itemId}`)}
                    className="w-full py-4.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    Track Live Delivery
                    <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
                  </Button>
                  <p className="text-[10px] text-slate-400 mt-2">Opening live tracking map in a moment...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </Card>

      </main>
    </div>
  );
}
