'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Loader2, CreditCard, Banknote, Smartphone, CheckCircle, Info, Lock } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const { items, activeRecovery, processPayment, addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // Checkout states
  const [paymentMethod, setMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [paymentState, setPaymentState] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [processingText, setProcessingText] = useState('Connecting securely...');

  // Input states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = items.find((i) => i.id === itemId);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Auto transition to delivery finder page upon payment success after 2.5 seconds
  useEffect(() => {
    if (paymentState === 'success') {
      const timeout = setTimeout(() => {
        router.push(`/delivery/${itemId}`);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [paymentState, itemId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-20 bg-slate-200 rounded-lg" />
          <div className="h-80 bg-white border border-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

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

  const recoveryFee = 49;
  const deliveryFee = activeRecovery.recoveryMethod === 'delivery' ? 79 : 0;
  const platformFee = 20;
  const totalFee = recoveryFee + deliveryFee + platformFee;

  const validatePaymentForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g. arpit@okaxis)';
      }
    } else if (paymentMethod === 'CARD') {
      if (!cardNumber.trim() || !/^[0-9]{16}$/.test(cardNumber.replace(/\s+/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!cardExpiry.trim() || !/^[0-9]{2}\/[0-9]{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Expiry must be in MM/YY format';
      }
      if (!cardCvv.trim() || !/^[0-9]{3}$/.test(cardCvv)) {
        newErrors.cardCvv = 'CVV must be 3 digits';
      }
      if (!cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePaymentForm()) {
      addToast('Please fix payment validation errors.', 'error');
      return;
    }

    setPaymentState('processing');
    
    // Simulate multi-step secure payment transition (3 seconds)
    const stages = [
      'Connecting securely...',
      'Verifying account balance...',
      'Confirming recovery claim...',
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingText(stages[i]);
    }

    // Call Provider payment success handler
    processPayment(paymentMethod);
    setPaymentState('success');
  };

  const steps = [
    { num: '01', name: 'Item', active: false, done: true },
    { num: '02', name: 'Questions', active: false, done: true },
    { num: '03', name: 'Recovery Option', active: false, done: true },
    { num: '04', name: 'Payment', active: true, done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        {paymentState === 'form' && (
          <button
            onClick={() => router.push(`/recovery/${item.id}`)}
            className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Address
          </button>
        )}

        {/* Steps header */}
        {paymentState === 'form' && (
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
        )}

        <AnimatePresence mode="wait">
          
          {/* 1. PAYMENT FORM PANEL */}
          {paymentState === 'form' && (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Column: Payment Options */}
              <div className="lg:col-span-7 space-y-6">
                <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white">
                  <div className="flex flex-col gap-1 mb-6">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Secure Checkout</span>
                    <h2 className="text-xl font-extrabold text-slate-900">Select payment method</h2>
                  </div>

                  {/* Payment option tabs */}
                  <div className="flex gap-2.5 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => setMethod('UPI')}
                      className={`flex-1 py-3.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none ${
                        paymentMethod === 'UPI' ? 'bg-white border border-slate-100 shadow-sm text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('CARD')}
                      className={`flex-1 py-3.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none ${
                        paymentMethod === 'CARD' ? 'bg-white border border-slate-100 shadow-sm text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('COD')}
                      className={`flex-1 py-3.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none ${
                        paymentMethod === 'COD' ? 'bg-white border border-slate-100 shadow-sm text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      COD
                    </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Method 1: UPI */}
                    {paymentMethod === 'UPI' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <Input
                          label="Enter UPI ID"
                          placeholder="e.g. arpit@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          error={errors.upiId}
                          helperText="Securely complete payment using GPay, PhonePe, or Paytm"
                          required
                        />
                      </motion.div>
                    )}

                    {/* Method 2: Credit/Debit Card */}
                    {paymentMethod === 'CARD' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <Input
                          label="Cardholder Name"
                          placeholder="Name as printed on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          error={errors.cardName}
                          required
                        />

                        <Input
                          label="Card Number"
                          placeholder="16-digit card number"
                          maxLength={16}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          error={errors.cardNumber}
                          required
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Expiry Date"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            error={errors.cardExpiry}
                            required
                          />
                          <Input
                            label="CVV"
                            placeholder="3 digits"
                            maxLength={3}
                            value={cardCvv}
                            type="password"
                            onChange={(e) => setCardCvv(e.target.value)}
                            error={errors.cardCvv}
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Method 3: COD */}
                    {paymentMethod === 'COD' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 text-xs"
                      >
                        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Cash on Delivery option</span>
                          <p className="text-slate-500 leading-normal">
                            Pay the full checkout invoice total of <span className="font-bold text-slate-900">₹{totalFee}</span> directly to Arjun Kumar when your item arrives.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-4 flex gap-4.5 border-t border-slate-50 mt-6">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-50"
                      >
                        <Lock className="w-4 h-4 text-white" />
                        Pay ₹{totalFee}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Right Column: Order Invoice summary */}
              <div className="lg:col-span-5 space-y-6">
                <Card hoverLift={false} className="border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Summary Summary</h3>
                  
                  {/* Item preview */}
                  <div className="flex gap-3.5 pb-4 border-b border-slate-100 items-center text-left">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-950 leading-tight">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 block">{item.category}</span>
                    </div>
                  </div>

                  {/* Payment fees list */}
                  <div className="space-y-3 pt-4 text-xs text-slate-500 text-left">
                    <div className="flex justify-between">
                      <span>Recovery Reward Fee</span>
                      <span className="font-bold text-slate-900">₹{recoveryFee}</span>
                    </div>
                    {activeRecovery.recoveryMethod === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Courier Delivery Fee</span>
                        <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Service Platform Fee</span>
                      <span className="font-bold text-slate-900">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-55 pt-3.5 font-extrabold text-slate-950 text-sm">
                      <span>Grand Total</span>
                      <span>₹{totalFee}</span>
                    </div>
                  </div>

                  {/* Delivery address details */}
                  <div className="mt-5 pt-4.5 border-t border-slate-100 text-xs text-left space-y-1.5 text-slate-650">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Shipment Address</span>
                    {activeRecovery.recoveryMethod === 'delivery' ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{activeRecovery.deliveryAddress?.fullName}</span>
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          {activeRecovery.deliveryAddress?.address}, {activeRecovery.deliveryAddress?.apartment}, {activeRecovery.deliveryAddress?.city}, {activeRecovery.deliveryAddress?.state} - {activeRecovery.deliveryAddress?.pincode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-semibold">Self-pickup coordination from handover station.</p>
                    )}
                  </div>
                </Card>

                {/* Trust and safety indicators */}
                <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 flex flex-col gap-3.5 text-xs text-slate-600 text-left">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand flex-shrink-0" />
                    <span>🔒 Secure SSL 256-bit checkout encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>✓ Verified recovery check matches</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* 2. TRANSACTION PROCESSING SCREEN */}
          {paymentState === 'processing' && (
            <motion.div
              key="payment-processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center gap-6 text-center justify-center my-auto w-full"
            >
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-brand stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 animate-pulse">{processingText}</h3>
                <p className="text-xs text-slate-500">Do not refresh this page. Payment is being processed securely.</p>
              </div>
            </motion.div>
          )}

          {/* 3. SUCCESS LANDING PANEL */}
          {paymentState === 'success' && (
            <motion.div
              key="payment-success"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 flex flex-col items-center gap-6 text-center justify-center my-auto max-w-md mx-auto w-full"
            >
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Payment Successful</h3>
                <p className="text-xs text-slate-500 px-6">
                  Your recovery request has been confirmed. Assigning your delivery courier rider.
                </p>
              </div>

              {/* Invoice details summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 w-full text-xs space-y-2 text-left">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Recovery ID</span>
                  <span className="font-extrabold text-slate-900">FB-REC-48291</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Amount Charged</span>
                  <span className="font-extrabold text-slate-800">₹{totalFee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Rider Courier Status</span>
                  <span className="font-extrabold text-brand animate-pulse">Finding partner...</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/delivery/${itemId}`)}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Find My Delivery Partner
                </Button>
                <p className="text-[10px] text-slate-400">Auto-transitioning in a few seconds...</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>
    </div>
  );
}
