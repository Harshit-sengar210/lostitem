'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Logo } from '@/app/page';

export default function LocationPage() {
  const router = useRouter();
  const { updateLocation, addToast } = useFoundBack();

  const [isLocating, setIsLocating] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [typedLocation, setTypedLocation] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [finalLocationName, setFinalLocationName] = useState('');

  const handleUseCurrent = () => {
    setIsLocating(true);
    // Simulate GPS ping
    setTimeout(() => {
      setIsLocating(false);
      setLocationSuccess(true);
      setFinalLocationName('Ghaziabad, Uttar Pradesh');
      updateLocation('Ghaziabad, Uttar Pradesh');
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        router.push('/home');
      }, 1500);
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedLocation.trim()) {
      addToast('Please enter a location.', 'error');
      return;
    }

    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setLocationSuccess(true);
      setFinalLocationName(typedLocation);
      updateLocation(typedLocation);

      setTimeout(() => {
        router.push('/home');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center gap-2 mb-6">
        <Logo className="text-brand" size={40} />
        <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Set Location
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card hoverLift={false} className="shadow-xl bg-white border border-slate-100 p-6 sm:p-8 flex flex-col gap-6 text-center">
          
          {/* Map Vector Graphic */}
          <div className="relative w-full h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 flex items-center justify-center">
            {/* Mock Map Grid lines */}
            <div className="absolute inset-0 opacity-25" style={{
              backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }} />
            
            {/* Mock roads */}
            <svg className="absolute inset-0 w-full h-full text-slate-200 stroke-current stroke-3 opacity-80 pointer-events-none" fill="none">
              <path d="M-10 40 L410 40 M-10 120 L410 120 M120 -10 L120 170 M280 -10 L280 170 M40 170 C 80 80, 160 20, 240 10" />
            </svg>

            <AnimatePresence mode="wait">
              {locationSuccess ? (
                <motion.div
                  key="success-indicator"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Location Locked</span>
                </motion.div>
              ) : isLocating ? (
                <motion.div
                  key="locating-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                  <span className="text-xs font-bold text-slate-600 animate-pulse">Scanning nearby networks...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative map-pulse z-10 w-10 h-10 bg-indigo-50 border-2 border-brand rounded-full flex items-center justify-center text-brand shadow-md"
                >
                  <MapPin className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {locationSuccess ? (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 py-4"
              >
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Perfect Match</span>
                <h3 className="text-xl font-extrabold text-slate-900">{finalLocationName}</h3>
                <p className="text-xs text-slate-500">Redirecting to marketplace...</p>
              </motion.div>
            ) : (
              <motion.div
                key="actions-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">Find what&apos;s nearby.</h3>
                  <p className="text-xs text-slate-500 px-6">
                    Set your location to find lost property in Indirapuram, Ghaziabad, Noida, and surrounding areas.
                  </p>
                </div>

                {!manualInput ? (
                  <div className="flex flex-col gap-3 mt-2">
                    <Button
                      variant="primary"
                      onClick={handleUseCurrent}
                      isLoading={isLocating}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4 fill-current" />
                      Use Current Location
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setManualInput(true)}
                      className="w-full"
                    >
                      Enter Location Manually
                    </Button>
                  </div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleManualSubmit}
                    className="flex flex-col gap-3 text-left mt-1"
                  >
                    <Input
                      label="Enter City or Area"
                      placeholder="e.g. Vaishali, Ghaziabad"
                      value={typedLocation}
                      onChange={(e) => setTypedLocation(e.target.value)}
                      leftIcon={<MapPin className="w-4 h-4" />}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setManualInput(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLocating}
                        className="flex-1"
                      >
                        Set Location
                      </Button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
