'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PlusCircle,
  MapPin,
  Compass,
  Truck,
  Smartphone,
  Wallet,
  ShoppingBag,
  FileText,
  Key,
  Gem,
  Laptop,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { MapIllustration } from '@/components/MapIllustration';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, ItemCategory, ItemStatus } from '@/data/mockItems';
import { ItemImage } from '@/components/ui/ItemImage';

export default function HomePage() {
  const router = useRouter();
  const { items, userLocation, addToast } = useFoundBack();

  const [selectedTab, setSelectedTab] = useState<'all' | 'lost' | 'found' | 'nearby'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate loader shimmer
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Quick Action: Track Delivery
  const handleTrackDelivery = () => {
    // Check if there is an active transit item
    const activeDelivery = items.find(
      (item) => item.status === 'CLAIMED' || item.status === 'PICKED_UP' || item.status === 'IN_TRANSIT' || item.status === 'DELIVERED'
    );
    if (activeDelivery) {
      addToast(`Active recovery found: ${activeDelivery.name}`, 'success');
      router.push(`/tracking/${activeDelivery.id}`);
    } else {
      addToast('No active deliveries found. Report or claim an item first.', 'info');
      router.push('/activity');
    }
  };

  // Filter Logic
  const filteredItems = items.filter((item) => {
    // 1. Filter by Lost/Found Tab
    if (selectedTab === 'lost' && item.status !== 'LOST') return false;
    if (selectedTab === 'found' && item.status !== 'FOUND' && item.status !== 'VERIFIED_PENDING') return false;
    if (selectedTab === 'nearby' && item.distance > 2.0) return false;

    // 2. Filter by Category Chip
    if (selectedCategory && item.category !== selectedCategory) return false;

    // 3. Search query match
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const locMatch = item.location.toLowerCase().includes(query);
      return nameMatch || descMatch || locMatch;
    }

    return true;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Key': return <Key className="w-4 h-4" />;
      case 'Gem': return <Gem className="w-4 h-4" />;
      case 'Laptop': return <Laptop className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'LOST':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-brand border border-indigo-100 uppercase tracking-wider">
            Lost
          </span>
        );
      case 'FOUND':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
            Found
          </span>
        );
      case 'VERIFIED_PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider animate-pulse">
            Verifying
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-wider">
            Claimed
          </span>
        );
    }
  };

  // Prepare pins for Map Illustration based on filtered list
  const mapPins: { x: number; y: number; type: 'lost' | 'found' | 'user'; name: string }[] = filteredItems.map((item, idx) => ({
    x: Math.floor(25 + (idx * 17) % 60), // deterministic layout coordinates
    y: Math.floor(20 + (idx * 23) % 65),
    type: item.status === 'LOST' ? 'lost' as const : 'found' as const,
    name: item.name
  }));

  // Append user pin
  mapPins.push({ x: 50, y: 50, type: 'user', name: 'Your Location' });

  // Grid animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* Responsive Header */}
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
        
        {/* ==================================================
            HERO DASHBOARD SECTION
            ================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4 text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Lost something<br className="hidden sm:inline" /> nearby{' '}
              <span className="text-brand">in {userLocation?.split(',')[0] || 'Ghaziabad'}?</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              Browse reported items around your location. Connect with verified finders, claim your belonging securely, and track delivery back to your doorstep.
            </p>

            {/* Mobile / Inline search bar */}
            <div className="relative flex items-center max-w-md w-full mt-2">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search lost items, phones, wallets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="lg:col-span-5 h-56 sm:h-64 lg:h-72 w-full">
            <MapIllustration pins={mapPins} />
          </div>
        </section>

        {/* ==================================================
            QUICK ACTIONS GRID
            ================================================== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <button
            onClick={() => router.push('/report/lost')}
            className="flex items-center gap-3.5 p-4 bg-white border border-slate-100 hover:border-indigo-100 rounded-2xl hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-brand group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Report Lost</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">List an item you lost</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/report/found')}
            className="flex items-center gap-3.5 p-4 bg-white border border-slate-100 hover:border-emerald-100 rounded-2xl hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Report Found</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">List an item you found</p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedTab('nearby');
              addToast('Filtering to items within 2.0 km', 'info');
            }}
            className="flex items-center gap-3.5 p-4 bg-white border border-slate-100 hover:border-blue-100 rounded-2xl hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Browse Nearby</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Under 2 km distance</p>
            </div>
          </button>

          <button
            onClick={handleTrackDelivery}
            className="flex items-center gap-3.5 p-4 bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-brand group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Track Recovery</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Monitor rider progress</p>
            </div>
          </button>
        </section>

        {/* ==================================================
            DISCOVERY / ITEMS NEAR YOU SECTION
            ================================================== */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Items Near You</h2>
              <p className="text-xs text-slate-400 mt-0.5">Discover reported items matching your location radius.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['all', 'lost', 'found', 'nearby'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all select-none ${
                    selectedTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all select-none border ${
                selectedCategory === null
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all select-none border ${
                  selectedCategory === cat.value
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid Layout Cards */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
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
                className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4 bg-white/40"
              >
                <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">No items found</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-6">
                    We couldn&apos;t find any matches matching your filters or search terms. Try modifying your search.
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedTab('all');
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="mt-2"
                >
                  Reset Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <Card noPadding className="h-full flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100/80 bg-white">
                      
                      {/* Image header */}
                      <div className="relative w-full h-44 overflow-hidden bg-slate-50">
                        <ItemImage
                          src={item.image}
                          alt={item.name}
                          category={item.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 z-10">
                          {getStatusBadge(item.status)}
                        </div>
                        {item.isVerified && (
                          <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-100 shadow-sm text-brand flex items-center gap-1 text-[9px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 fill-current text-indigo-500 text-white" />
                            Verified Founder
                          </div>
                        )}
                      </div>

                      {/* Content body */}
                      <div className="p-5 flex-grow flex flex-col gap-3 text-left">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Location / Meta details */}
                        <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-50 text-slate-500">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                            <span>{item.distance} km away</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Action */}
                      <div className="px-5 pb-5 pt-1 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-600">
                            {item.finderName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 max-w-[80px] truncate">
                            {item.finderName}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/item/${item.id}`)}
                          className="py-1.5 px-3 rounded-lg text-[10px]"
                        >
                          <Eye className="w-3 h-3" />
                          View Item
                        </Button>
                      </div>

                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
    </div>
  );
}
