'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, CreditCard, Smartphone, Trash2, X, ShieldCheck } from 'lucide-react';
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
        try {
          setMethods(JSON.parse(stored));
        } catch {
          setMethods([]);
        }
      } else {
        setMethods([]);
      }
    }
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const saveToStorage = (updated: PaymentMethodItem[]) => {
    setMethods(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fb_saved_payments_list', JSON.stringify(updated));
    }
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (methodType === 'UPI') {
      if (!upiVal.includes('@')) {
        addToast('Please enter a valid UPI ID (e.g. name@okaxis).', 'error');
        return;
      }
      const newItem: PaymentMethodItem = {
        id: `pay-${Date.now()}`,
        type: 'UPI',
        title: upiVal.trim(),
        subtitle: 'UPI ID',
      };
      saveToStorage([newItem, ...methods]);
    } else {
      const cleanNum = cardNum.replace(/\s+/g, '');
      if (cleanNum.length < 12) {
        addToast('Please enter a valid card number.', 'error');
        return;
      }
      const last4 = cleanNum.slice(-4);
      const newItem: PaymentMethodItem = {
        id: `pay-${Date.now()}`,
        type: 'CARD',
        title: `•••• •••• •••• ${last4}`,
        subtitle: cardName.trim() || 'Debit / Credit Card',
      };
      saveToStorage([newItem, ...methods]);
    }

    addToast('Payment method saved.', 'success');
    setShowModal(false);
    setUpiVal('');
    setCardNum('');
    setCardName('');
  };

  const handleDelete = (id: string) => {
    const updated = methods.filter((m) => m.id !== id);
    saveToStorage(updated);
    addToast('Payment method removed.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-48 bg-white border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={() => router.push('/profile')}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Header & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Payment Methods</h2>
            <p className="text-xs text-slate-500">Used for courier delivery fees and security deposits.</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Method
          </Button>
        </div>

        {/* Methods list */}
        {methods.length === 0 ? (
          <Card hoverLift={false} className="p-8 text-center border-slate-100 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No payment methods saved</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add your UPI ID or card to speed up claim verifications and deliveries.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowModal(true)}
              className="mt-4"
            >
              Add First Method
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {methods.map((item) => (
              <Card key={item.id} hoverLift={false} className="p-4 border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-brand">
                    {item.type === 'UPI' ? <Smartphone className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900">Add Payment Method</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMethodType('UPI')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    methodType === 'UPI'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType('CARD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    methodType === 'CARD'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Card
                </button>
              </div>

              <form onSubmit={handleAddMethod} className="space-y-3.5">
                {methodType === 'UPI' ? (
                  <Input
                    label="UPI ID / VPA"
                    placeholder="yourname@okhdfcbank"
                    value={upiVal}
                    onChange={(e) => setUpiVal(e.target.value)}
                    required
                  />
                ) : (
                  <>
                    <Input
                      label="Cardholder Name"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                    <Input
                      label="Card Number"
                      placeholder="16-digit card number"
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      required
                    />
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Save Method
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
