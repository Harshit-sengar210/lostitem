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
  Heart
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORIES, ItemCategory } from '@/data/mockItems';

export default function ReportFoundPage() {
  const router = useRouter();
  const { reportFoundItem, addToast } = useFoundBack();

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
  const [condition, setCondition] = useState('good');

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1 && !category) {
      addToast('Please select a category to continue.', 'error');
      return;
    }
    if (step === 2 && (!name || !description || !uniqueDetails)) {
      addToast('Please fill in all details.', 'error');
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

      const generatedId = reportFoundItem({
        name,
        category,
        location,
        date,
        description,
        uniqueDetails,
        image: 'https://images.unsplash.com/photo-1588449668338-d134af2c3e4f?q=80&w=600&auto=format&fit=crop', // AirPods placeholder or general
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

        {/* Wizard Steps indicator */}
        {!success && (
          <div className="flex gap-1.5 border-b border-slate-200/50 pb-5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full bg-slate-200 relative overflow-hidden">
                {idx + 1 < step && <div className="absolute inset-0 bg-emerald-500" />}
                {idx + 1 === step && <div className="absolute inset-0 bg-emerald-500 animate-pulse" />}
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
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-md animate-bounce">
                  <Heart className="w-8 h-8 stroke-[2.5] fill-current" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Report Successful</span>
                  <h3 className="text-xl font-extrabold text-slate-900">Thank you for helping!</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-6">
                    Your found report has been published. The status is set to <span className="font-bold text-emerald-600">Verification Pending</span>. We will alert you when matches are claimed.
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
                    View Item details
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Category */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 01 &bull; Category Selection</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">What did you find?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Select a category below to list the found item.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all text-xs font-extrabold select-none ${
                              category === cat.value
                                ? 'border-emerald-500 bg-emerald-50/10 text-emerald-700 ring-2 ring-emerald-100'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${category === cat.value ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
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
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 02 &bull; Item Details</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Describe the item found</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Provide titles and condition specifications.</p>
                      </div>

                      <Input
                        label="What did you find?"
                        placeholder="e.g. Apple AirPods Pro Case"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Item Condition</label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none"
                        >
                          <option value="mint">Mint (Like New)</option>
                          <option value="good">Good (Minor Scratches)</option>
                          <option value="fair">Fair (Visible Scuffs)</option>
                          <option value="poor">Damaged / Non-functional</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Public Description</label>
                        <textarea
                          placeholder="e.g. Found AirPods Pro case inside Shipra Mall food court. Case has a small scratch on the front cover. Charges perfectly."
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
                          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                            Withheld details
                          </span>
                        </label>
                        <textarea
                          placeholder="e.g. A small red lightning bolt sticker is on the back near the hinge. This details is NOT shown publicly."
                          value={uniqueDetails}
                          onChange={(e) => setUniqueDetails(e.target.value)}
                          rows={2}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none placeholder:text-slate-400"
                          required
                        />
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Do not reveal unique details publicly. This detail helps verify the true owner.
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
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 03 &bull; Location & Date</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Where & when did you find it?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Specify estimated coordinates and dates.</p>
                      </div>

                      <Input
                        label="Approximate Location Found"
                        placeholder="e.g. Food Court floor near burger stand, Shipra Mall"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                      />

                      <Input
                        label="Date & Time Found"
                        placeholder="e.g. Today, 2:35 PM"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                      />
                    </motion.div>
                  )}

                  {/* Step 4: Photo upload */}
                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 04 &bull; Image Upload</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Upload item images</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Provide photographic evidence if possible.</p>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 rounded-2xl py-10 px-4 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-emerald-500/40 transition-colors flex flex-col items-center gap-3 cursor-pointer">
                        <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700">Drag and drop images here</span>
                          <span className="text-[10px] text-slate-400 block">PNG, JPG or WEBP up to 5MB</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Terms */}
                  {step === 5 && (
                    <motion.div
                      key="step-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Step 05 &bull; Terms Validation</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Safety Handover Terms</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Please review safety guidelines before submitting.</p>
                      </div>

                      <div className="space-y-3.5 text-xs text-slate-600">
                        <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand w-4 h-4 mt-0.5" />
                          <p className="leading-relaxed">
                            I agree to coordinate handovers only in well-lit, public settings for physical safety.
                          </p>
                        </div>
                        <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand w-4 h-4 mt-0.5" />
                          <p className="leading-relaxed">
                            I confirm that the descriptions provided are genuine and I physically found this item.
                          </p>
                        </div>
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
                      Submit Found Report
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
