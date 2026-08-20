'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, ChevronDown, BookOpen, MessageSquare, Shield, ShieldAlert, Award } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpCenterPage() {
  const router = useRouter();
  const { addToast } = useFoundBack();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { name: 'Reporting', icon: BookOpen, desc: 'How to list lost/found items' },
    { name: 'Verification', icon: Shield, desc: 'Ownership checking steps' },
    { name: 'Payments', icon: Award, desc: 'Platform fees and rewards' },
    { name: 'Delivery', icon: HelpCircle, desc: ' courier rider tracking' },
  ];

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How does ownership verification work?',
      answer: 'Ownership verification ensures items are returned to their actual owners. When you click Claim, you will be asked specific questions (like last-seen location details, serial numbers, or unique stickers) matching details withheld by the finder. Our team checks your answers before approving the claim.'
    },
    {
      id: 'faq-2',
      question: 'Can I report an item anonymously?',
      answer: 'Yes. FoundBack values your safety. You can list items without publishing your profile name or phone number. Handover operations can be handled entirely via our courier delivery partner network.'
    },
    {
      id: 'faq-3',
      question: 'How is my location used?',
      answer: 'Your location is used to filter listings nearby and calculate courier delivery routes. FoundBack never shares exact coordinates with other users publicly.'
    },
    {
      id: 'faq-4',
      question: 'What happens after I claim an item?',
      answer: 'Once ownership is verified, you configure recovery delivery preferences (Deliver to Me or Pick Up Myself) and make secure payment. A delivery partner is assigned to bring it directly to your address.'
    },
    {
      id: 'faq-5',
      question: 'Can I cancel a recovery?',
      answer: 'Yes, recoveries can be cancelled before the courier rider picks up the item from the handover station. Simply contact support or cancel the task from details.'
    }
  ];

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getFilteredFaqs = () => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q));
  };

  const filteredFaqs = getFilteredFaqs();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/profile')}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-slate-900">How can we help?</h1>
          <p className="text-xs text-slate-450">Search documentation and frequently asked support questions.</p>
        </div>

        {/* Help Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-450" />
          <input
            type="text"
            placeholder="Search FAQs, articles, safety guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 shadow-sm"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => addToast(`Opening ${cat.name} section...`, 'info')}
                className="p-4 bg-white border border-slate-100/80 rounded-2xl flex flex-col items-center gap-2 text-center transition-all hover:shadow-md hover:border-indigo-100 focus:outline-none"
              >
                <div className="p-2 bg-indigo-50/50 rounded-xl text-brand">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">{cat.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-1 leading-normal">{cat.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordions list */}
        <div className="space-y-3.5 mt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Frequently Asked Questions</h3>
          
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center border border-slate-200 border-dashed rounded-3xl bg-white/40 flex flex-col items-center gap-3">
              <HelpCircle className="w-6 h-6 text-slate-400" />
              <p className="text-xs text-slate-500">No matching FAQ articles found. Try a different keyword.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <Card
                  key={faq.id}
                  hoverLift={false}
                  noPadding
                  className="border border-slate-150 bg-white overflow-hidden rounded-2xl shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(faq.id)}
                    className="w-full py-4.5 px-5 flex items-center justify-between text-left focus:outline-none font-bold text-slate-800 hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-xs leading-normal">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-350 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-50 bg-slate-50/20"
                      >
                        <p className="p-5 text-xs text-slate-550 leading-relaxed font-semibold">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })
          )}
        </div>

        {/* Contact Support CTA */}
        <Card hoverLift={false} className="border border-indigo-100 bg-indigo-50/20 p-5.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex gap-3 items-start">
            <MessageSquare className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Still have questions?</span>
              <p className="text-[10px] text-slate-500 leading-normal mt-1 font-semibold">
                Our support desk coordinates verified claims disputes and courier handover questions.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToast('Connecting support ticket...', 'success')}
            className="py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap"
          >
            Contact Support
          </Button>
        </Card>

      </main>
    </div>
  );
}
