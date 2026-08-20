'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Smartphone,
  Wallet,
  ShoppingBag,
  Key,
  Compass,
  MapPin,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, ItemCategory } from '@/data/mockItems';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items } = useFoundBack();

  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState(items);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'black wallet',
    'iPhone',
    'AirPods',
    'blue backpack',
  ]);

  // Sync initial query from URL search parameters (?q=...)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setSubmittedQuery(q);
      performSearch(q);
    } else {
      setResults(items);
    }
  }, [searchParams, items]);

  const performSearch = (searchVal: string) => {
    const cleanVal = searchVal.trim().toLowerCase();
    if (!cleanVal) {
      setResults(items);
      return;
    }

    const filtered = items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(cleanVal);
      const descMatch = item.description.toLowerCase().includes(cleanVal);
      const locMatch = item.location.toLowerCase().includes(cleanVal);
      const catMatch = item.category.toLowerCase().includes(cleanVal);
      const statusMatch = item.status.toLowerCase().includes(cleanVal);

      return nameMatch || descMatch || locMatch || catMatch || statusMatch;
    });

    setResults(filtered);

    // Save to recents
    if (searchVal.trim() && !recentSearches.includes(searchVal.trim())) {
      setRecentSearches((prev) => [searchVal.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
    performSearch(query);
  };

  const handleRecentClick = (val: string) => {
    setQuery(val);
    setSubmittedQuery(val);
    performSearch(val);
  };

  const handleCategoryClick = (catVal: ItemCategory) => {
    router.push(`/explore?cat=${catVal}`);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="self-start inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">What are you looking for?</h1>
          <p className="text-xs text-slate-400 mt-0.5">Search reported lost or found items across Ghaziabad & Delhi NCR.</p>
        </div>

        {/* Search bar input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for black wallet, AirPods, keys..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-100 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSubmittedQuery('');
                setResults(items);
              }}
              className="absolute right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Results or Recommendations */}
        <AnimatePresence mode="wait">
          {!submittedQuery ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"
            >
              {/* Recent searches */}
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</h3>
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-slate-500">No recent searches.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        type="button"
                        onClick={() => handleRecentClick(search)}
                        className="text-left px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors truncate"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular categories */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Popular Categories</h3>
                <div className="grid grid-cols-2 gap-3.5">
                  {CATEGORIES.slice(0, 4).map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2.5 transition-all text-xs font-extrabold hover:border-indigo-100 hover:shadow-md text-slate-800"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-2"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Results for &quot;{submittedQuery}&quot;
                </h3>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {results.length} items found
                </span>
              </div>

              {results.length === 0 ? (
                <div className="py-16 text-center border border-slate-200 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-white/40">
                  <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">No matching items yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm px-6">
                      Try a different keyword search or report your lost item to notify you of future matches.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/report/lost')}
                    className="mt-2"
                  >
                    Report Lost Item
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item) => (
                    <Card
                      key={item.id}
                      noPadding
                      className="flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100/80 bg-white"
                    >
                      <div className="relative w-full h-40 overflow-hidden bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          {item.status === 'LOST' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-brand border border-indigo-100 uppercase">Lost</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">Found</span>
                          )}
                        </div>
                        {item.isVerified && (
                          <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/95 border border-slate-100 shadow-sm text-brand flex items-center gap-1 text-[9px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 fill-current text-indigo-500 text-white" />
                            Verified
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-grow flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                        <h3 className="text-xs font-extrabold text-slate-900 truncate">{item.name}</h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-col gap-1 pt-2 border-t border-slate-50 mt-1 text-slate-400">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-semibold mt-1">
                            <span>{item.distance} km away</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <span className="text-[9px] font-bold text-slate-500 truncate max-w-[90px]">
                          By: {item.finderName}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/item/${item.id}`)}
                          className="py-1 px-2.5 rounded-lg text-[9px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
