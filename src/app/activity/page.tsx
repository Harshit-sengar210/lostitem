'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ShieldCheck,
  Compass,
  Truck,
  Calendar,
  Eye,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Check,
  Award,
  ChevronRight,
  Star,
  User as UserIcon,
  Tag,
  X
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Reusable animated count digit hook
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 800; // ms
    const increment = Math.ceil(end / 15) || 1;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 15);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { items, user, activeRecovery, addToast } = useFoundBack();

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'recoveries'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);

  // Sync tab from URL ?tab=
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lost' || tab === 'found' || tab === 'recoveries') {
      setActiveTab(tab);
    } else {
      setActiveTab('all');
    }
    
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleTabChange = (tab: 'all' | 'lost' | 'found' | 'recoveries') => {
    setActiveTab(tab);
    router.push(`/activity?tab=${tab}`);
  };

  // Filter listings based on search and parameters
  const lostItems = items.filter(
    (item) => item.status === 'LOST' && item.finderName.includes('You')
  );

  const foundItems = items.filter(
    (item) => item.status === 'FOUND' && item.finderName === user?.name
  );

  const pastRecoveries = items.filter(
    (item) => item.status === 'CLAIMED' && item.id !== activeRecovery?.itemId
  );

  // Compile list based on selected tab
  const getTabFilteredItems = () => {
    switch (activeTab) {
      case 'lost': return lostItems;
      case 'found': return foundItems;
      case 'recoveries': return pastRecoveries;
      default: return [...lostItems, ...foundItems, ...pastRecoveries];
    }
  };

  // Apply search query & custom filters (Status, Date)
  const getFilteredList = () => {
    let list = getTabFilteredItems();

    // 1. Search filter (Name, Report ID, Recovery ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const reportMatch = item.id.toLowerCase().includes(q);
        const recoveryMatch = item.recoveryId?.toLowerCase().includes(q);
        return nameMatch || reportMatch || recoveryMatch;
      });
    }

    // 2. Status filter (Active/Completed)
    if (filterStatus === 'active') {
      list = list.filter((item) => item.status === 'LOST' || item.status === 'FOUND');
    } else if (filterStatus === 'completed') {
      list = list.filter((item) => item.status === 'CLAIMED');
    }

    return list;
  };

  const currentList = getFilteredList();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOST':
        return <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-indigo-100 uppercase">Searching</span>;
      case 'FOUND':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100 uppercase">Verification Pending</span>;
      case 'CLAIMED':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100 uppercase">Recovered</span>;
      default:
        return <span className="bg-slate-50 text-slate-650 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-slate-100 uppercase">{status}</span>;
    }
  };

  const getTabCount = (tab: 'all' | 'lost' | 'found' | 'recoveries') => {
    if (tab === 'lost') return lostItems.length;
    if (tab === 'found') return foundItems.length;
    if (tab === 'recoveries') return pastRecoveries.length + (activeRecovery ? 1 : 0);
    return lostItems.length + foundItems.length + pastRecoveries.length + (activeRecovery ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Profile Activity Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">My Activity</h1>
            <p className="text-xs text-slate-400">Track everything you&apos;ve reported, found and recovered.</p>
          </div>

          {/* Harshit community profile summary */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs self-start md:self-center">
            <div className="w-10 h-10 bg-indigo-50 border border-brand/20 text-brand font-extrabold text-sm rounded-xl flex items-center justify-center">
              {user ? user.name.split(' ').map(n=>n[0]).join('') : 'H'}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block text-xs leading-tight">{user?.name || 'Harshit'}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Community Member &bull; Verified</span>
            </div>
          </div>
        </div>

        {/* Animated Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Lost */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs flex flex-col gap-1 text-left"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lost Items</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={12} />
            </div>
            <span className="text-[9px] text-indigo-500 font-bold block mt-1">+1 this month</span>
          </motion.div>

          {/* Card 2: Found */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs flex flex-col gap-1 text-left"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Found Items</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={8} />
            </div>
            <span className="text-[9px] text-emerald-500 font-bold block mt-1">+3 this week</span>
          </motion.div>

          {/* Card 3: Recovered */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs flex flex-col gap-1 text-left"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recovered</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={6} />
            </div>
            <span className="text-[9px] text-emerald-500 font-bold block mt-1">+2 this month</span>
          </motion.div>

          {/* Card 4: Active */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs flex flex-col gap-1 text-left"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Recoveries</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={activeRecovery ? 1 : 0} />
            </div>
            <span className="text-[9px] text-brand font-bold block mt-1">In transit</span>
          </motion.div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto select-none">
          {(['all', 'lost', 'found', 'recoveries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all relative flex items-center gap-1.5 whitespace-nowrap focus:outline-none ${
                activeTab === tab
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Activity' : tab === 'lost' ? 'Lost Reports' : tab === 'found' ? 'Found Reports' : 'Recoveries'}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab ? 'bg-indigo-50 text-brand' : 'bg-slate-100 text-slate-500'
              }`}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search activity bar and filter selectors */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search activity */}
          <div className="relative flex items-center w-full sm:max-w-xs">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-50 shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Custom status selector */}
          <div className="flex gap-2 self-end sm:self-center">
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-brand shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Reports</option>
              <option value="completed">Completed claims</option>
            </select>
          </div>
        </div>

        {/* Dynamic Activity Panels */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 h-24 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              key="content-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* ==================================================
                  SECTION: ACTIVE RECOVERIES PREVIEWS
                  ================================================== */}
              {activeTab === 'recoveries' && activeRecovery && (
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active claim</h3>
                  
                  {/* Load matching item */}
                  {(() => {
                    const activeItem = items.find((i) => i.id === activeRecovery.itemId);
                    if (!activeItem) return null;

                    return (
                      <Card hoverLift={false} className="border border-indigo-150 bg-white shadow-md p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                        <div className="flex items-center gap-4">
                          <img src={activeItem.image} alt={activeItem.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0" />
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Claim Status: In Progress</span>
                            <h4 className="text-sm font-extrabold text-slate-950 truncate max-w-[180px] sm:max-w-[280px]">
                              {activeItem.name}
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-semibold pt-1">
                              <span className="flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                Verified
                              </span>
                              {activeRecovery.paymentStatus === 'completed' && (
                                <span className="flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  Paid
                                </span>
                              )}
                              {activeRecovery.partnerStatus === 'assigned' && (
                                <span className="flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  Rider Assigned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3.5 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimated Arrival</span>
                            <span className="text-sm font-extrabold text-slate-950">
                              {activeRecovery.eta > 0 ? `${activeRecovery.eta} mins` : 'Arrived / Delivered'}
                            </span>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/tracking/${activeItem.id}`)}
                            className="py-2.5 px-5 rounded-xl text-xs font-bold shadow-sm"
                          >
                            Track Recovery
                          </Button>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              )}

              {/* No items empty screen fallback */}
              {currentList.length === 0 && (
                <div className="py-16 text-center border border-slate-200 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-white/40">
                  <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-950">No activity matching filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm px-6">
                      Try resetting your search query or look at alternative dashboard categories.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="mt-2 text-xs font-bold py-2 px-4 rounded-xl">
                    Reset filters
                  </Button>
                </div>
              )}

              {/* Items Card List mapping */}
              {currentList.length > 0 && (
                <div className="flex flex-col gap-4">
                  {currentList.map((item) => (
                    <Card
                      key={item.id}
                      hoverLift
                      noPadding
                      className="flex flex-col sm:flex-row items-center border border-slate-100 bg-white shadow-xs overflow-hidden"
                    >
                      {/* Photo preview */}
                      <div className="w-full sm:w-36 h-28 flex-shrink-0 bg-slate-50 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content panel */}
                      <div className="p-4.5 flex-grow min-w-0 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                              {item.name}
                            </h3>
                            {getStatusBadge(item.status)}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-1">
                            <span>Reported: {item.date}</span>
                            <span>Distance: {item.distance} km</span>
                          </div>

                          {/* Historical Completed Ratings */}
                          {item.status === 'CLAIMED' && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-500 font-extrabold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-slate-400 font-bold ml-1.5 text-[9.5px]">5/5 Rating completed</span>
                            </div>
                          )}
                        </div>

                        {/* View button details shortcut */}
                        <div className="flex-shrink-0 self-end sm:self-center flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/item/${item.id}`)}
                            className="py-1.5 px-3 rounded-lg text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </Button>
                        </div>
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

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading activity...</div>}>
      <ActivityContent />
    </Suspense>
  );
}
