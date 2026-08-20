'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Wallet,
  ShoppingBag,
  FileText,
  Key,
  Gem,
  Laptop,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  Camera,
  Mail,
  Info
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORIES, ItemCategory } from '@/data/mockItems';

export default function ReportLostPage() {
  const router = useRouter();
  const { reportLostItem, addToast } = useFoundBack();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newId, setNewId] = useState('');

  // Form states
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uniqueDetails, setUniqueDetails] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [contactPref, setContactPref] = useState<'email' | 'phone' | 'both'>('both');

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1 && !category) {
      addToast('Please select a category to continue.', 'error');
      return;
    }
    if (step === 2 && (!name || !description || !uniqueDetails)) {
      addToast('Please fill in all description fields.', 'error');
      return;
    }
    if (step === 3 && (!location || !date)) {
      addToast('Please specify location and date details.', 'error');
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock network request
    setTimeout(() => {
      setLoading(false);
      if (!category) return;

      const generatedId = reportLostItem({
        name,
        category,
        location,
        date,
        description,
        uniqueDetails,
        image: 'https://images.unsplash.com/photo-1593005510509-d05e267f4c9c?q=80&w=600&auto=format&fit=crop', // default photo placeholder
      });

      setNewId(generatedId);
      setSuccess(true);
    }, 1500);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      case 'Gem': return <Gem className="w-5 h-5" />;
      case 'Laptop': return <Laptop className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={() => {
            if (success) router.push('/home');
            else if (step > 1) handleBack();
            else router.back();
          }}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {success ? 'Close Wizard' : step > 1 ? 'Previous Step' : 'Cancel'}
        </button>

        {/* Wizard Steps indicator bar */}
        {!success && (
          <div className="flex gap-1.5 border-b border-slate-200/50 pb-5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full bg-slate-200 relative overflow-hidden">
                {idx + 1 < step && <div className="absolute inset-0 bg-brand" />}
                {idx + 1 === step && <div className="absolute inset-0 bg-brand animate-pulse" />}
              </div>
            ))}
          </div>
        )}

        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8">
          <AnimatePresence mode="wait">
            
            {success ? (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center gap-5 text-center"
              >
                <div className="w-16 h-16 bg-indigo-50 border border-brand/20 rounded-full flex items-center justify-center text-brand shadow-md animate-bounce">
                  <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Report Successful</span>
                  <h3 className="text-xl font-extrabold text-slate-900">Lost Item Listed!</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-6">
                    Your lost listing for &quot;{name}&quot; has been indexed in the database. We will notify you if a matching item is reported.
                  </p>
                </div>

                <div className="w-full flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/home')}
                  >
                    Go to Homepage
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => router.push(`/item/${newId}`)}
                  >
                    View Listing
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Category selection */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 01 &bull; Category Selection</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">What did you lose?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Select a category below to list your lost property.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all text-xs font-extrabold select-none ${
                              category === cat.value
                                ? 'border-brand bg-indigo-50/20 text-brand ring-2 ring-indigo-100'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${category === cat.value ? 'bg-indigo-50 text-brand' : 'bg-slate-50 text-slate-400'}`}>
                              {getCategoryIcon(cat.icon)}
                            </div>
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Item Details */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 02 &bull; Item Details</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Tell us about the item</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Provide titles and detailed specifications.</p>
                      </div>

                      <Input
                        label="Item Name / Title"
                        placeholder="e.g. Blue American Tourister Backpack"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Public Description</label>
                        <textarea
                          placeholder="e.g. Left a blue backpack. Has a couple of textbooks inside, somewhat worn at the bottom. Do NOT write your phone number or passwords here."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none placeholder:text-slate-400"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Private Unique Detail
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                            Withheld details
                          </span>
                        </label>
                        <textarea
                          placeholder="e.g. Written name 'Amit' in marker on internal sleeve, small key ring inside front pocket..."
                          value={uniqueDetails}
                          onChange={(e) => setUniqueDetails(e.target.value)}
                          rows={2}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none placeholder:text-slate-400"
                          required
                        />
                        <p className="text-[10px] text-slate-400 leading-normal">
                          This detail will remain hidden. Claimants must match this detail to prove ownership.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Location and Date */}
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 03 &bull; Location & Date</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Where & when did you lose it?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Specify neighborhood details and estimated dates.</p>
                      </div>

                      <Input
                        label="Last Seen Location"
                        placeholder="e.g. Sector 62 Metro Station platforms, Noida"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                      />

                      <Input
                        label="Estimated Date & Time"
                        placeholder="e.g. Aug 19, 11:00 AM"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                      />
                    </motion.div>
                  )}

                  {/* Step 4: Photos upload */}
                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 04 &bull; Photo Upload</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Upload item images</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Upload photos to help identify the item easily.</p>
                      </div>

                      {/* Drag area */}
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl py-10 px-4 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-brand/40 transition-colors flex flex-col items-center gap-3 cursor-pointer">
                        <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700">Drag and drop images here</span>
                          <span className="text-[10px] text-slate-400 block">PNG, JPG or WEBP up to 5MB</span>
                        </div>
                      </div>

                      <div className="flex gap-2 p-3 bg-amber-50/20 border border-amber-100 rounded-xl text-[10px] text-slate-600">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="leading-relaxed">
                          Do not upload photos containing sensitive personal information (such as credit card numbers or IDs showing full addresses) in clear view.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Contact Pref */}
                  {step === 5 && (
                    <motion.div
                      key="step-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 05 &bull; Contact Preferences</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Contact Preferences</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Select how you want verified finders to reach you.</p>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        {(['email', 'phone', 'both'] as const).map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => setContactPref(pref)}
                            className={`p-4 border rounded-xl flex items-center gap-3 text-xs font-bold select-none transition-all ${
                              contactPref === pref
                                ? 'border-brand bg-indigo-50/20 text-brand ring-2 ring-indigo-100'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <Mail className="w-4 h-4 text-brand" />
                            <span className="capitalize">{pref === 'both' ? 'Email & Phone calls' : pref}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-5 border-t border-slate-50 mt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNext}
                      className="flex-1 group"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      isLoading={loading}
                    >
                      Submit Lost Report
                    </Button>
                  )}
                </div>
              </form>
            )}

          </AnimatePresence>
        </Card>

      </main>
    </div>
  );
}
