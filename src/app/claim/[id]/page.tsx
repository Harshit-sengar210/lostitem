'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Info,
  Check,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  X,
  Compass,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ClaimPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const { items, submitVerification, addToast } = useFoundBack();
  const [loading, setLoading] = useState(true);

  // Form step tracker
  const [currentStep, setCurrentStep] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Verification process overlays
  const [verifyingState, setVerifyingState] = useState<'form' | 'checking' | 'passed' | 'failed'>('form');
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkText, setCheckText] = useState('Reviewing your answers...');

  // Questions values
  const [lostDate, setLostDate] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [color, setColor] = useState('');
  const [modelBrand, setModelBrand] = useState('');
  const [uniqueDetail, setUniqueDetail] = useState('');

  // Evidence files simulator
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  const item = items.find((i) => i.id === itemId);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-20 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-white border border-slate-200 rounded-3xl" />
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

  // Categories specific questions list
  const getQuestions = () => {
    const defaultQs = [
      { id: 'date', label: 'When did you lose this item?', value: lostDate, setter: setLostDate, placeholder: 'e.g. August 20, 2:00 PM', hint: 'Provide your best estimate' },
      { id: 'seen', label: 'Where did you last have it?', value: lastSeen, setter: setLastSeen, placeholder: 'e.g. Near mall entrance seating', hint: 'Helps matching local zones' },
      { id: 'color', label: 'What color is the body/case?', value: color, setter: setColor, placeholder: 'e.g. Dark grey case with red stripes', hint: 'Describe base colors' },
      { id: 'detail', label: 'Describe one unique private detail (scratches, stickers, etc.)', value: uniqueDetail, setter: setUniqueDetail, placeholder: 'e.g. Yellow key ring attached, initials written', hint: 'This detail is withheld by finders' }
    ];

    if (item.category === 'electronics' || item.category === 'phone') {
      return [
        ...defaultQs.slice(0, 3),
        { id: 'brand', label: 'What brand / model is the device?', value: modelBrand, setter: setModelBrand, placeholder: 'e.g. Apple AirPods Pro 2nd Gen', hint: 'Specify official names' },
        defaultQs[3]
      ];
    }
    
    if (item.category === 'wallet' || item.category === 'bag') {
      return [
        ...defaultQs.slice(0, 3),
        { id: 'brand', label: 'What brand / lining pattern is it?', value: modelBrand, setter: setModelBrand, placeholder: 'e.g. Woodland brown leather, inner zip', hint: 'Specify texture details' },
        defaultQs[3]
      ];
    }

    return defaultQs;
  };

  const questions = getQuestions();

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setQuestionIndex(0);
    } else if (currentStep === 2) {
      // Validate current question index
      const curQ = questions[questionIndex];
      if (!curQ.value.trim()) {
        addToast('Please provide an answer to continue.', 'error');
        return;
      }

      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setQuestionIndex(questions.length - 1);
    } else if (currentStep === 2) {
      if (questionIndex > 0) {
        setQuestionIndex(questionIndex - 1);
      } else {
        setCurrentStep(1);
      }
    }
  };

  const handleMockUpload = () => {
    // Add mock files
    const mockFiles = [
      { name: 'purchase_invoice.pdf', size: '242 KB', type: 'document' },
      { name: 'photo_with_device.jpg', size: '1.2 MB', type: 'image' },
    ];
    const selectFile = mockFiles[evidenceFiles.length % mockFiles.length];
    
    setEvidenceFiles((prev) => [...prev, selectFile]);
    addToast('File uploaded successfully', 'success');
  };

  const handleRemoveFile = (idx: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx));
    addToast('Photo removed', 'info');
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingState('checking');
    
    // Simulate verification checking stages (3 seconds total)
    const stages = [
      { progress: 25, text: 'Reviewing your answers...' },
      { progress: 55, text: 'Comparing item details...' },
      { progress: 85, text: 'Checking recovery information...' },
      { progress: 100, text: 'Verification complete' },
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCheckProgress(stages[i].progress);
      setCheckText(stages[i].text);
    }

    // Call provider comparison logic
    const passed = await submitVerification({
      lostTime: lostDate,
      lastSeen,
      color,
      uniqueDetail,
    });

    if (passed) {
      setVerifyingState('passed');
    } else {
      setVerifyingState('failed');
    }
  };

  const handleRetry = () => {
    setUniqueDetail('');
    setCurrentStep(1);
    setVerifyingState('form');
  };

  const stepsList = [
    { num: '01', name: 'Item', active: currentStep === 1, done: currentStep > 1 },
    { num: '02', name: 'Questions', active: currentStep === 2, done: currentStep > 2 },
    { num: '03', name: 'Evidence', active: currentStep === 3, done: currentStep > 3 },
    { num: '04', name: 'Review', active: currentStep === 4, done: currentStep > 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        {verifyingState === 'form' && (
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        )}

        {/* Wizard Steps indicator bar */}
        {verifyingState === 'form' && (
          <div className="grid grid-cols-4 gap-2 border-b border-slate-200/50 pb-5">
            {stepsList.map((st) => (
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

        {/* Dynamic Card Container */}
        <Card hoverLift={false} className="shadow-lg border border-slate-100 bg-white p-6 sm:p-8 relative min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* 1. FORM SETUP */}
            {verifyingState === 'form' && (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-grow flex flex-col justify-between h-full"
              >
                
                {/* STEP 1: CONFIRM ITEM */}
                {currentStep === 1 && (
                  <div className="space-y-6 flex-grow">
                    <div>
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 01 &bull; Item Confirmation</span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">Is this your item?</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Please confirm the item you believe you lost.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center sm:text-left min-w-0">
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">You are claiming</span>
                        <h3 className="text-base font-extrabold text-slate-900 truncate mt-0.5">{item.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5 justify-center sm:justify-start font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4.5 pt-4 border-t border-slate-50">
                      <Button variant="outline" className="flex-1" onClick={() => router.push(`/item/${item.id}`)}>
                        Go Back
                      </Button>
                      <Button variant="primary" className="flex-1" onClick={handleNextStep}>
                        Yes, Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: QUESTIONS (One question at a time) */}
                {currentStep === 2 && (
                  <div className="space-y-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 02 &bull; Verification Questions</span>
                        <span className="text-[10px] font-bold text-slate-400">Question {questionIndex + 1} of {questions.length}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">Answer verifying details</h2>
                    </div>

                    {/* Single question view transition */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={questionIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="py-2 flex-grow space-y-4"
                      >
                        <Input
                          label={questions[questionIndex].label}
                          placeholder={questions[questionIndex].placeholder}
                          value={questions[questionIndex].value}
                          onChange={(e) => questions[questionIndex].setter(e.target.value)}
                          helperText={questions[questionIndex].hint}
                          required
                          autoFocus
                        />
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex gap-4.5 pt-4 border-t border-slate-50">
                      <Button variant="outline" className="flex-1" onClick={handlePrevStep}>
                        Back
                      </Button>
                      <Button variant="primary" className="flex-1" onClick={handleNextStep}>
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: OPTIONAL EVIDENCE */}
                {currentStep === 3 && (
                  <div className="space-y-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 03 &bull; Supporting Evidence</span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">Help us confirm it&apos;s yours</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Upload receipt bills, box serials, or screenshots (optional).</p>
                    </div>

                    {/* Drag and drop zone */}
                    <div 
                      onClick={handleMockUpload}
                      className="border-2 border-dashed border-slate-200 hover:border-brand/40 bg-slate-50 hover:bg-slate-100/50 rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center gap-3.5 select-none"
                    >
                      <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700">Drag & drop files here or click to browse</span>
                        <span className="text-[10px] text-slate-400 block">PDF, PNG, JPG up to 5MB</span>
                      </div>
                    </div>

                    {/* Uploaded items listing */}
                    <AnimatePresence>
                      {evidenceFiles.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex flex-col gap-2 overflow-hidden"
                        >
                          {evidenceFiles.map((file, idx) => (
                            <motion.div
                              key={idx}
                              layout
                              className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-left"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                                <div className="truncate">
                                  <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                                  <span className="text-[9px] text-slate-400">{file.size}</span>
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Privacy tips */}
                    <div className="flex gap-2 p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-[10px] text-slate-600">
                      <Info className="w-4 h-4 text-brand flex-shrink-0" />
                      <p>Never upload passwords, payment information or sensitive personal documents.</p>
                    </div>

                    <div className="flex gap-4.5 pt-4 border-t border-slate-50">
                      <Button variant="outline" className="flex-1" onClick={handlePrevStep}>
                        Back
                      </Button>
                      <Button variant="primary" className="flex-1" onClick={handleNextStep}>
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Step 04 &bull; Summary Review</span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">Review your answers</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Please double check your claim inputs before submission.</p>
                    </div>

                    {/* Responses lists */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-4 max-h-60 overflow-y-auto">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">You are claiming</span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        </div>
                      </div>

                      {questions.map((q) => (
                        <div key={q.id} className="flex flex-col gap-0.5 text-xs">
                          <span className="text-slate-400 font-bold text-[9px] uppercase">{q.label}</span>
                          <span className="text-slate-800 font-semibold">{q.value}</span>
                        </div>
                      ))}

                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-400 font-bold text-[9px] uppercase">Uploaded Evidence files</span>
                        <span className="text-slate-800 font-semibold">
                          {evidenceFiles.length === 0 ? 'No files attached' : `${evidenceFiles.length} file(s) attached`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-[10px] text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <p>Your information is only used to verify ownership.</p>
                    </div>

                    <div className="flex gap-4.5 pt-4 border-t border-slate-50">
                      <Button variant="outline" className="flex-1" onClick={handlePrevStep}>
                        Back
                      </Button>
                      <Button variant="primary" className="flex-1 animate-pulse" onClick={handleSubmission}>
                        Submit Verification
                      </Button>
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* 2. CHECKING MOCK PROCESS */}
            {verifyingState === 'checking' && (
              <motion.div
                key="checking-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center gap-6 text-center justify-center my-auto"
              >
                {/* Circular animated spinner */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-20 h-20 text-indigo-100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#4f46e5"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="250"
                      animate={{ strokeDashoffset: [250, 0] }}
                      transition={{ duration: 3.2, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute text-brand font-extrabold text-sm">{checkProgress}%</div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 animate-pulse">{checkText}</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Analyzing verification logs. Matching with target descriptors.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. SUCCESS STATE */}
            {verifyingState === 'passed' && (
              <motion.div
                key="passed-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 flex flex-col items-center gap-6 text-center justify-center my-auto"
              >
                <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                  <Check className="w-8 h-8 stroke-[3.5]" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Verified ✓
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">Ownership verified</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-4">
                    We&apos;ve confirmed enough information to continue the recovery process.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 w-full max-w-xs text-xs space-y-2 text-left">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Recovery ID</span>
                    <span className="text-slate-900 font-extrabold">FB-REC-48291</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Target Item</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[120px]">{item.name}</span>
                  </div>
                </div>

                <div className="w-full flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => router.push(`/item/${item.id}`)}>
                    View Item
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={() => router.push(`/recovery/${item.id}`)}>
                    Continue Recovery
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 4. FAILURE STATE */}
            {verifyingState === 'failed' && (
              <motion.div
                key="failed-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 flex flex-col items-center gap-6 text-center justify-center my-auto"
              >
                <div className="w-16 h-16 bg-red-100 border-2 border-red-500 rounded-full flex items-center justify-center text-red-600 shadow-sm">
                  <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Unmatched Details
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">We couldn&apos;t verify ownership</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-4">
                    Some of your answers didn&apos;t match the verification details provided by the finder of this item.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 text-xs text-slate-600 text-left">
                  <span className="font-bold text-slate-850 block mb-1">Tips for matching:</span>
                  Ensure you describe specific custom keychains, stickers, initial tags, or exact color matches. Our verification checks protect belongings from fraudulent claims.
                </div>

                <div className="w-full flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => router.push(`/item/${item.id}`)}>
                    Return to Item
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleRetry}>
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>

      </main>
    </div>
  );
}
