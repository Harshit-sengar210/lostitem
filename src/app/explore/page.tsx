'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wallet,
  ShoppingBag,
  FileText,
  Key,
  Gem,
  Laptop,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  X,
  Compass
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, ItemCategory, ItemStatus } from '@/data/mockItems';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items } = useFoundBack();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Suggested keywords
  const POPULAR_SEARCHES = ['AirPods', 'Wallet', 'iPhone', 'Keys', 'Backpack'];

  // Initialize query from search params if any
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);

    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Filter items
  const filteredItems = items.filter((item) => {
    // 1. Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatches = item.name.toLowerCase().includes(q);
      const descMatches = item.description.toLowerCase().includes(q);
      const locMatches = item.location.toLowerCase().includes(q);
      if (!nameMatches && !descMatches && !locMatches) return false;
    }

    // 2. Status
    if (statusFilter === 'LOST' && item.status !== 'LOST') return false;
    if (statusFilter === 'FOUND' && item.status !== 'FOUND' && item.status !== 'VERIFIED_PENDING') return false;

    // 3. Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;

    // 4. Distance
    if (item.distance > maxDistance) return false;

    // 5. Verification
    if (verifiedOnly && !item.isVerified) return false;

    return true;
  });

  const handleCategoryToggle = (cat: ItemCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSelectedCategories([]);
    setMaxDistance(10);
    setVerifiedOnly(false);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-3.5 h-3.5" />;
      case 'Wallet': return <Wallet className="w-3.5 h-3.5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'FileText': return <FileText className="w-3.5 h-3.5" />;
      case 'Key': return <Key className="w-3.5 h-3.5" />;
      case 'Gem': return <Gem className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      default: return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-900">Explore Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter, locate, and claim matching property listed near you.</p>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* ==================================================
              SIDEBAR FILTERS PANEL (Desktop)
              ================================================== */}
          <aside className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand" />
                Filters
              </span>
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-brand hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Status</span>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {(['ALL', 'LOST', 'FOUND'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all select-none ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-100'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status === 'LOST' ? 'Lost' : 'Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</span>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
                      />
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(cat.icon)}
                        {cat.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Distance Radius</span>
                <span className="text-slate-700 lowercase font-semibold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>1 km</span>
                <span>15 km</span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex flex-col gap-2 border-t border-slate-50 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Verified Founders Only
                </span>
              </label>
            </div>
          </aside>

          {/* ==================================================
              MAIN LISTINGS CONTENT (Right)
              ================================================== */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            
            {/* Search Bar Input */}
            <div className="flex flex-col gap-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search listings by title, description, or neighborhood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-50 shadow-xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Popular Searches Recommendation tags */}
              <div className="flex flex-wrap items-center gap-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
                {POPULAR_SEARCHES.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => setSearchQuery(keyword)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-[10px] font-semibold transition-colors select-none"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters summary */}
            {(selectedCategories.length > 0 || statusFilter !== 'ALL' || verifiedOnly || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1.5 text-left border-t border-slate-200/50 pt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
                
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                    Query: &quot;{searchQuery}&quot;
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}

                {statusFilter !== 'ALL' && (
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                    Status: {statusFilter}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('ALL')} />
                  </span>
                )}

                {selectedCategories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100 capitalize">
                    {cat}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryToggle(cat)} />
                  </span>
                ))}

                {verifiedOnly && (
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                    Verified Only
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                  </span>
                )}
              </div>
            )}

            {/* Listings Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm animate-pulse">
                      <div className="w-full h-40 bg-slate-200 rounded-xl" />
                      <div className="space-y-2">
                        <div className="w-1/3 h-4 bg-slate-200 rounded" />
                        <div className="w-3/4 h-5 bg-slate-200 rounded" />
                        <div className="w-1/2 h-3.5 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-16 text-center border border-slate-200 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-white/40"
                >
                  <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">No results match filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm px-6">
                      No listings were found matching your combined filters or search parameters. Try loosening your constraints.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-2"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 text-left"
                >
                  {filteredItems.map((item) => (
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading explore directory...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
