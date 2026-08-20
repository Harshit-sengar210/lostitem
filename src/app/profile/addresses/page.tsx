'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Trash2, Edit3, X, Home, Briefcase, Bookmark } from 'lucide-react';
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

  // Initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_saved_addresses_list');
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        const initial = [
          {
            id: 'addr-1',
            label: 'Home',
            fullName: 'Arpit Goyal',
            phone: '9876543210',
            address: 'Tower 3, Flat 104, Shipra Sun City, Indirapuram',
            apartment: 'Shipra Mall Road',
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            pincode: '201014'
          },
          {
            id: 'addr-2',
            label: 'Work',
            fullName: 'Arpit Goyal',
            phone: '9876543210',
            address: 'Block C-20, Stellar IT Park, Sector 62',
            apartment: 'Noida Office Hub',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301'
          }
        ];
        setAddresses(initial);
        localStorage.setItem('fb_saved_addresses_list', JSON.stringify(initial));
      }
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const saveToLocalStorage = (list: SavedAddress[]) => {
    setAddresses(list);
    localStorage.setItem('fb_saved_addresses_list', JSON.stringify(list));
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    saveToLocalStorage(updated);
    addToast('Address deleted', 'info');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      addToast('Please fill out all required fields.', 'error');
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
      pincode
    };

    const updated = [...addresses, newAddr];
    saveToLocalStorage(updated);
    
    // Clear forms
    setFullName('');
    setPhone('');
    setAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPincode('');
    setShowModal(false);
    
    addToast('Address added successfully', 'success');
  };

  const getLabelIcon = (labelStr: string) => {
    switch (labelStr.toLowerCase()) {
      case 'home': return <Home className="w-4 h-4 text-brand" />;
      case 'work': return <Briefcase className="w-4 h-4 text-brand" />;
      default: return <Bookmark className="w-4 h-4 text-brand" />;
    }
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
        
        {/* Back navigation */}
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
            Add Address
          </Button>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Saved Addresses</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage delivery destinations for item claims recovery courier partners.</p>
        </div>

        {/* Addresses listing */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="py-16 text-center border border-slate-200 border-dashed rounded-3xl bg-white/40 flex flex-col items-center gap-3">
              <MapPin className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-500">No saved addresses found. Add one to speed up checkouts.</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>Add New Address</Button>
            </div>
          ) : (
            addresses.map((addr) => (
              <Card
                key={addr.id}
                hoverLift={false}
                className="border border-slate-100 bg-white p-5 flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="flex gap-3.5 text-left min-w-0 pr-6">
                  <div className="p-2 bg-indigo-50/50 rounded-xl text-brand flex-shrink-0 self-start">
                    {getLabelIcon(addr.label)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{addr.label}</span>
                      <span className="text-[10px] text-slate-450">&bull; {addr.fullName} ({addr.phone})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      {addr.address}, {addr.apartment && `${addr.apartment}, `}{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 hover:bg-red-50 text-slate-450 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

      </main>

      {/* ==================================================
          MODAL DRAWER: ADD NEW ADDRESS
          ================================================== */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4 backdrop-blur-xs"
            />
            {/* Form sheet */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed inset-x-4 top-[8%] sm:top-[12%] mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-8 z-55 border border-slate-100 shadow-2xl flex flex-col gap-5 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900">Add New Address</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-slate-55 rounded-lg text-slate-400 hover:text-slate-650"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-4">
                {/* Label selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Label</label>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setLabel(lbl)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          label === lbl ? 'border-brand bg-indigo-50/20 text-brand font-extrabold ring-1 ring-indigo-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Arpit Goyal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Street Address"
                  placeholder="Apartment, Society, Block..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Landmark"
                    placeholder="e.g. Near Metro Station"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Ghaziabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="State"
                    placeholder="Uttar Pradesh"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 py-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3"
                  >
                    Save Address
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
