'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Trash2, X, Home, Briefcase, Bookmark, PlusCircle } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
}

export default function SavedAddressesPage() {
  const router = useRouter();
  const { addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);
  
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Initial load from user storage (no hardcoded dummy addresses)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_saved_addresses_list');
      if (stored) {
        try {
          setAddresses(JSON.parse(stored));
        } catch {
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    }
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const saveToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fb_saved_addresses_list', JSON.stringify(updated));
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !city || !pincode) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label,
      fullName,
      phone,
      address,
      apartment,
      city,
      state,
      pincode,
    };

    saveToStorage([newAddr, ...addresses]);
    addToast('Address added successfully.', 'success');
    setShowModal(false);

    // Reset form
    setFullName('');
    setPhone('');
    setAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPincode('');
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveToStorage(updated);
    addToast('Address deleted.', 'info');
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
            <h2 className="text-xl font-extrabold text-slate-900">Saved Addresses</h2>
            <p className="text-xs text-slate-500">Addresses for item courier delivery and pick-up.</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>

        {/* Address Cards List */}
        {addresses.length === 0 ? (
          <Card hoverLift={false} className="p-8 text-center border-slate-100 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No saved addresses yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add your home or office address to make recovery claims and dispatch easier.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowModal(true)}
              className="mt-4"
            >
              Add First Address
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {addresses.map((item) => (
              <Card key={item.id} hoverLift={false} className="p-5 border-slate-100 bg-white flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-brand px-2 py-0.5 rounded-full">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.fullName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.apartment ? `${item.apartment}, ` : ''}{item.address}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.city}, {item.state} - {item.pincode}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">📞 {item.phone}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* Add Address Modal */}
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
                <h3 className="text-base font-extrabold text-slate-900">Add New Address</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-3.5">
                <div className="flex gap-2 mb-2">
                  {(['Home', 'Work', 'Other'] as const).map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setLabel(tag)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        label === tag
                          ? 'bg-brand text-white border-brand'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <Input
                  label="Full Name"
                  placeholder="Receiver's name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="Street Address / House No."
                  placeholder="Flat, building, street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <Input
                  label="Apartment / Landmark"
                  placeholder="Near metro, floor, etc. (optional)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="City"
                    placeholder="e.g. Noida"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="Pincode"
                    placeholder="e.g. 201301"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Save Address
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
