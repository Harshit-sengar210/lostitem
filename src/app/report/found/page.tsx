'use client';

import React, { useState, useRef } from 'react';
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
  CheckCircle,
  MapPin,
  Calendar,
  Camera,
  Heart,
  UploadCloud,
  X
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORIES, ItemCategory } from '@/data/mockItems';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

export default function ReportFoundPage() {
  const router = useRouter();
  const { reportFoundItem, addToast } = useFoundBack();
  const { upload, uploading } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [uploadedImage, setUploadedImage] = useState<string>('');

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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size exceeds 10MB limit.', 'error');
      return;
    }

    const cloudUrl = await upload(file, 'foundback/found_items');
    if (cloudUrl) {
      setUploadedImage(cloudUrl);
      addToast('Photo uploaded to Cloudinary! 📸', 'success');
    } else {
      const localUrl = URL.createObjectURL(file);
      setUploadedImage(localUrl);
      addToast('Photo selected.', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setLoading(true);

    try {
      const generatedId = await reportFoundItem({
        name,
        category,
        location,
        date,
        description,
        uniqueDetails,
        image: uploadedImage || 'https://images.unsplash.com/photo-1593005510509-d05e267f4c9c?q=80&w=600&auto=format&fit=crop',
      });

      setNewId(generatedId);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      addToast('Failed to save found report: ' + (err?.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
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
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
                  <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Thank You For Helping!</span>
                  <h3 className="text-xl font-extrabold text-slate-900">Found Item Listed in Database</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-6">
                    Your found report for &quot;{name}&quot; is active in Firestore. When the verified owner claims it, you will be notified!
                  </p>
                </div>

                <div className="w-full flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/activity?tab=found')}
                  >
                    View in My Activity
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
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">What item did you find?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Select a category below to list found property.</p>
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
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Item Title & Characteristics</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Help the real owner identify it.</p>
                      </div>

                      <Input
                        label="Item Name / Title"
                        placeholder="e.g. Black Leather Wallet with cards"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Public Description</label>
                        <textarea
                          placeholder="e.g. Found on a bench. Good condition, leather material. Do not reveal private ID numbers or security codes."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none placeholder:text-slate-400"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          Private Verification Detail
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                            Verification key
                          </span>
                        </label>
                        <textarea
                          placeholder="e.g. Card ending with 4821 inside, specific brand name or engraving..."
                          value={uniqueDetails}
                          onChange={(e) => setUniqueDetails(e.target.value)}
                          rows={2}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none placeholder:text-slate-400"
                          required
                        />
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
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Where & when did you find it?</h2>
                      </div>

                      <Input
                        label="Found Location"
                        placeholder="e.g. Shipra Mall, Food Court, Indirapuram"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                      />

                      <Input
                        label="Date & Time Found"
                        placeholder="e.g. Today, 2:30 PM"
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
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">Upload item photo</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Upload a photo to Cloudinary so the owner can recognise it.</p>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {uploadedImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uploadedImage}
                            alt="Uploaded item"
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedImage('')}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl py-10 px-4 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-brand/40 transition-colors flex flex-col items-center gap-3 cursor-pointer"
                        >
                          <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs">
                            {uploading ? (
                              <UploadCloud className="w-6 h-6 animate-pulse text-brand" />
                            ) : (
                              <Camera className="w-6 h-6" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700">
                              {uploading ? 'Uploading to Cloudinary...' : 'Click to select a photo from your device'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">PNG, JPG, WEBP up to 10MB</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 5: Condition */}
                  {step === 5 && (
                    <motion.div
                      key="step-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 05 &bull; Item Condition</span>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-1">What condition is it in?</h2>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'mint', label: 'Like New' },
                          { id: 'good', label: 'Good' },
                          { id: 'damaged', label: 'Damaged' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCondition(c.id)}
                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 text-xs font-bold select-none transition-all ${
                              condition === c.id
                                ? 'border-brand bg-indigo-50/20 text-brand ring-2 ring-indigo-100'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>{c.label}</span>
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
                      isLoading={loading || uploading}
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
