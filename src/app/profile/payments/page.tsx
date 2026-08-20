'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, CreditCard, Smartphone, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PaymentMethodItem {
  id: string;
  type: 'UPI' | 'CARD';
  title: string;
  subtitle: string;
}

export default function PaymentsSettingsPage() {
  const router = useRouter();
  const { addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [methodType, setMethodType] = useState<'UPI' | 'CARD'>('UPI');
  const [upiVal, setUpiVal] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_saved_payments_list');
      if (stored) {
        setMethods(JSON.parse(stored));
      } else {
        const initial: PaymentMethodItem[] = [
          { id: 'pay-1', type: 'UPI', title: 'harshit@upi', subtitle: 'Primary UPI address' },
          { id: 'pay-2', type: 'CARD', title: '•••• •••• •••• 4821', subtitle: 'Visa Debit Card' }
        ];
        setMethods(initial);
        localStorage.setItem('fb_saved_payments_list', JSON.stringify(initial));
      }
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const saveToLocalStorage = (list: PaymentMethodItem[]) => {
    setMethods(list);
    localStorage.setItem('fb_saved_payments_list', JSON.stringify(list));
  };

  const handleDelete = (id: string) => {
    const updated = methods.filter((m) => m.id !== id);
    saveToLocalStorage(updated);
    addToast('Payment method removed', 'info');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();

    let newMethod: PaymentMethodItem;

    if (methodType === 'UPI') {
      if (!upiVal.trim() || !upiVal.includes('@')) {
        addToast('Please enter a valid UPI address.', 'error');
        return;
      }
      newMethod = {
        id: `pay-${Date.now()}`,
        type: 'UPI',
        title: upiVal.trim(),
        subtitle: 'UPI account'
      };
    } else {
      const cleanNum = cardNum.replace(/\s+/g, '');
      if (cleanNum.length < 16) {
        addToast('Please enter a 16-digit card number.', 'error');
        return;
      }
      newMethod = {
        id: `pay-${Date.now()}`,
        type: 'CARD',
        title: `•••• •••• •••• ${cleanNum.slice(-4)}`,
        subtitle: 'Credit Card'
      };
    }

    const updated = [...methods, newMethod];
    saveToLocalStorage(updated);
    
    // Reset forms
    setUpiVal('');
    setCardNum('');
    setCardName('');
    setShowModal(false);

    addToast('Payment method added', 'success');
  };

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
        
        {/* Back link */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/profile')}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModal(true)}
            className="py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 border-brand text-brand hover:bg-indigo-50/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Method
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment Methods</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage UPI credentials and credit/debit card invoice information.</p>
        </div>

        {/* Mock payments list */}
        <div className="space-y-4">
          {methods.length === 0 ? (
            <div className="py-16 text-center border border-slate-200 border-dashed rounded-3xl bg-white/40 flex flex-col items-center gap-3">
              <CreditCard className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-500">No payment credentials saved. Add one to speed up checkout claims.</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>Add Payment Method</Button>
            </div>
          ) : (
            methods.map((item) => (
              <Card
                key={item.id}
                hoverLift={false}
                className="border border-slate-100 bg-white p-5 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex gap-3.5 text-left min-w-0 pr-6">
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl text-brand flex-shrink-0">
                    {item.type === 'UPI' ? <Smartphone className="w-4.5 h-4.5" /> : <CreditCard className="w-4.5 h-4.5" />}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">{item.subtitle}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-50 text-slate-450 hover:text-red-500 rounded-xl transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))
          )}
        </div>

        {/* Info secure box */}
        <div className="bg-indigo-50/20 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">PCI-DSS Tokenization Checks</span>
            <p className="text-[11px] leading-normal text-slate-500 mt-0.5">
              FoundBack never stores actual raw credentials. Payment identifiers are masked and secure tokens are generated to process delivery claims safely.
            </p>
          </div>
        </div>

      </main>

      {/* ==================================================
          MODAL DRAWER: ADD PAYMENT METHOD
          ================================================== */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed inset-x-4 top-[20%] mx-auto max-w-sm bg-white rounded-3xl p-6 sm:p-8 z-55 border border-slate-100 shadow-2xl flex flex-col gap-4 text-left"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900">Add Payment Method</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Toggles */}
              <div className="flex gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethodType('UPI')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    methodType === 'UPI' ? 'bg-white border border-slate-100 shadow-sm text-slate-950 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType('CARD')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    methodType === 'CARD' ? 'bg-white border border-slate-100 shadow-sm text-slate-950 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Credit Card
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4 mt-2">
                {methodType === 'UPI' ? (
                  <Input
                    label="Enter UPI ID"
                    placeholder="e.g. harshit@okaxis"
                    value={upiVal}
                    onChange={(e) => setUpiVal(e.target.value)}
                    required
                  />
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="Cardholder Name"
                      placeholder="Name printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                    <Input
                      label="Card Number"
                      placeholder="16-digit card number"
                      maxLength={16}
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 py-2.5"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-2.5"
                  >
                    Save Method
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
