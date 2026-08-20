'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, MapPinCheckInside, Clock } from 'lucide-react';
import { useFoundBack, RecoveryAddress } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RecoveryPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const { items, selectRecoveryMethod, saveAddress, activeRecovery, addToast, user } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // Recovery configuration states
  const [recoveryMethod, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(true);

  // Address fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = items.find((i) => i.id === itemId);

  // Seed mock saved address
  const MOCK_SAVED_ADDRESS: RecoveryAddress = {
    fullName: 'Arpit Goyal',
    phone: '9876543210',
    address: 'Tower 3, Flat 104, Shipra Sun City, Indirapuram',
    apartment: 'Shipra Mall Road',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pincode: '201014'
  };

  useEffect(() => {
    // Populate form if address exists in recovery context
    if (activeRecovery?.deliveryAddress) {
      const addr = activeRecovery.deliveryAddress;
      setFullName(addr.fullName);
      setPhone(addr.phone);
      setAddress(addr.address);
      setApartment(addr.apartment);
      setCity(addr.city);
      setState(addr.state);
      setPincode(addr.pincode);
    }
    
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeRecovery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-80 bg-white border border-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">Item not found</h2>
          <Button onClick={() => router.push('/home')}>Home</Button>
        </div>
      </div>
    );
  }

  const handleUseSavedAddress = () => {
    setFullName(MOCK_SAVED_ADDRESS.fullName);
    setPhone(MOCK_SAVED_ADDRESS.phone);
    setAddress(MOCK_SAVED_ADDRESS.address);
    setApartment(MOCK_SAVED_ADDRESS.apartment);
    setCity(MOCK_SAVED_ADDRESS.city);
    setState(MOCK_SAVED_ADDRESS.state);
    setPincode(MOCK_SAVED_ADDRESS.pincode);
    setErrors({});
    addToast('Saved address loaded', 'success');
  };

  const validateAddressForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!address.trim()) newErrors.address = 'Delivery Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (recoveryMethod === 'delivery') {
      if (!validateAddressForm()) {
        addToast('Please fix address validation errors.', 'error');
        return;
      }
      
      saveAddress({
        fullName,
        phone,
        address,
        apartment,
        city,
        state,
        pincode
      });
    } else {
      // Self pickup mock address
      saveAddress({
        fullName: user?.name || 'Arpit Goyal',
        phone: user?.phone || '9876543210',
        address: item.location,
        apartment: 'Handover Station',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201014'
      });
    }

    selectRecoveryMethod(recoveryMethod);
    router.push(`/payment/${item.id}`);
  };

  // Fee calculation configs
  const recoveryFee = 49;
  const deliveryFee = recoveryMethod === 'delivery' ? 79 : 0;
  const platformFee = 20;
  const totalFee = recoveryFee + deliveryFee + platformFee;

  const steps = [
    { num: '01', name: 'Item', active: false, done: true },
    { num: '02', name: 'Questions', active: false, done: true },
    { num: '03', name: 'Recovery Option', active: true, done: false },
    { num: '04', name: 'Payment Done', active: false, done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push(`/item/${item.id}`)}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel checkout
        </button>

        {/* Wizard Steps indicator */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-200/50 pb-5">
          {steps.map((st) => (
            <div key={st.num} className="flex flex-col gap-1.5">
              <div className="h-1 rounded-full bg-slate-200 relative overflow-hidden">
                {st.done && <div className="absolute inset-0 bg-emerald-500 animate-shimmer" />}
                {st.active && <div className="absolute inset-0 bg-brand animate-pulse" />}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-1">
                <span className={`text-[10px] font-extrabold ${st.active || st.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {st.num}
                </span>
                <span className={`text-[9px] font-bold truncate max-w-[80px] sm:max-w-none ${st.active || st.done ? 'text-slate-800 font-extrabold' : 'text-slate-400'}`}>
                  {st.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main checkout wrapper */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-1.5 mb-6">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 03 &bull; Recovery Details</span>
            <h2 className="text-xl font-extrabold text-slate-900">Let&apos;s get your item back</h2>
            <p className="text-xs text-slate-500">
              Configure delivery locations and choose handover options.
            </p>
          </div>

          {/* Quick item badge status */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between mb-6 text-left">
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.location.split(',')[0]}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 uppercase">
              Verified ✓
            </span>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* Options grid selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 2: Deliver to Me (Recommended) */}
              <button
                type="button"
                onClick={() => setMethod('delivery')}
                className={`p-4 border rounded-2xl flex items-start gap-3 transition-all text-left relative select-none ${
                  recoveryMethod === 'delivery'
                    ? 'border-brand bg-indigo-50/20 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Recommended
                </span>

                <div className={`p-2 rounded-xl flex-shrink-0 ${recoveryMethod === 'delivery' ? 'bg-indigo-50 text-brand' : 'bg-slate-50 text-slate-400'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="pr-12">
                  <h4 className="text-xs font-extrabold text-slate-900">Deliver to Me</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Have a verified delivery partner bring it directly to you.
                  </p>
                </div>
              </button>

              {/* Option 1: Pickup Myself */}
              <button
                type="button"
                onClick={() => setMethod('pickup')}
                className={`p-4 border rounded-2xl flex items-start gap-3 transition-all text-left select-none ${
                  recoveryMethod === 'pickup'
                    ? 'border-brand bg-indigo-50/20 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${recoveryMethod === 'pickup' ? 'bg-indigo-50 text-brand' : 'bg-slate-50 text-slate-400'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Pick Up Myself</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Collect the item from the verified handover location.
                  </p>
                </div>
              </button>
            </div>

            {/* Delivery address forms */}
            <AnimatePresence mode="wait">
              {recoveryMethod === 'delivery' ? (
                <motion.div
                  key="address-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-50 overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Delivery Address</span>
                    <button
                      type="button"
                      onClick={handleUseSavedAddress}
                      className="text-[10px] font-bold text-brand hover:underline"
                    >
                      Use saved address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="e.g. Arpit Goyal"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={errors.fullName}
                      required
                    />
                    <Input
                      label="Mobile Number"
                      placeholder="10-digit number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={errors.phone}
                      required
                    />
                  </div>

                  <Input
                    label="Street Address"
                    placeholder="House/Flat No., Tower, Society Name..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={errors.address}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Apartment / Landmark"
                      placeholder="e.g. Near Shipra Mall"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                    <Input
                      label="Pincode"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      error={errors.pincode}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="Ghaziabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      error={errors.city}
                      required
                    />
                    <Input
                      label="State"
                      placeholder="Uttar Pradesh"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      error={errors.state}
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pickup-rules"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t border-slate-50 overflow-hidden text-slate-650"
                >
                  <div className="flex gap-3 p-4 bg-amber-50/15 border border-amber-100 rounded-2xl text-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">Pickup Instructions</span>
                      <p className="leading-relaxed">
                        Handover will be coordinated at the reported location: <span className="font-bold text-slate-950">{item.location}</span>. Ensure meetings are arranged in bright, public areas (like metro station gates) for safety.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Accordion Card */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs mt-4">
              <button
                type="button"
                onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                className="w-full bg-slate-50/70 hover:bg-slate-50 px-5 py-3.5 flex justify-between items-center text-xs font-bold text-slate-800 focus:outline-none"
              >
                <span>Cost Summary</span>
                <div className="flex items-center gap-1">
                  <motion.span 
                    key={totalFee}
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-slate-950 font-extrabold text-sm"
                  >
                    ₹{totalFee}
                  </motion.span>
                  {showFeeBreakdown ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              <AnimatePresence>
                {showFeeBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 bg-white px-5 py-4 text-xs space-y-3.5 text-slate-500 overflow-hidden text-left"
                  >
                    <div className="flex justify-between">
                      <span>Item Recovery processing reward</span>
                      <span className="font-bold text-slate-800">₹{recoveryFee}</span>
                    </div>
                    {recoveryMethod === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Courier rider delivery fee</span>
                        <span className="font-bold text-slate-800">₹{deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Platform service charge</span>
                      <span className="font-bold text-slate-800">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-55 pt-3.5 font-extrabold text-slate-900 text-sm">
                      <span>Total Invoice</span>
                      <span>₹{totalFee}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delivery estimates map summary */}
            {recoveryMethod === 'delivery' && (
              <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4.5 flex items-center justify-between text-xs mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Clock className="w-4 h-4 text-brand" />
                    <span>Estimated Arrival: <span className="font-bold text-slate-900">25-35 minutes</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <MapPin className="w-4 h-4 text-brand" />
                    <span>Distance: <span className="font-bold text-slate-900">4.2 km</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Deliverer: <span className="font-bold text-slate-900">Verified Partner</span></span>
                  </div>
                </div>

                {/* Tiny vector map preview */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200/60 bg-slate-100 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full text-slate-200 stroke-current stroke-2" fill="none">
                    <path d="M-5 20 L85 20 M35 -5 L35 85 M10 70 Q 40 40 70 10" />
                  </svg>
                  <MapPin className="w-4 h-4 text-brand absolute top-3 right-3 animate-bounce" />
                  <MapPin className="w-4 h-4 text-indigo-400 absolute bottom-3 left-3" />
                </div>
              </div>
            )}

            {/* Actions footer */}
            <div className="flex gap-4 pt-4 border-t border-slate-50 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/item/${item.id}`)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 group"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>

          </form>
        </Card>

      </main>
    </div>
  );
}
