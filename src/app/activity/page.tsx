'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Eye,
  CheckCircle,
  Briefcase,
  Star,
  Trash2,
  Edit3,
  X,
  Save,
  Plus
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Item } from '@/data/mockItems';
import { ItemImage } from '@/components/ui/ItemImage';
import { auth } from '@/backend/firebase';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 600;
    const increment = Math.ceil(end / 10) || 1;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 10);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { items, user, activeRecovery, deleteUserItem, updateUserItem, addToast } = useFoundBack();

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'recoveries'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lost' || tab === 'found' || tab === 'recoveries') {
      setActiveTab(tab);
    } else {
      setActiveTab('all');
    }
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleTabChange = (tab: 'all' | 'lost' | 'found' | 'recoveries') => {
    setActiveTab(tab);
    router.push(`/activity?tab=${tab}`);
  };

  const currentUid = auth.currentUser?.uid;
  const currentEmail = user?.email || auth.currentUser?.email || '';

  // Filter listings based on actual ownership
  const isUserLostItem = (item: any) => {
    if (item.status !== 'LOST') return false;
    if (currentUid && item.reporterId === currentUid) return true;
    if (currentEmail && item.reporterEmail === currentEmail) return true;
    if (item.finderName?.includes('You')) return true;
    return false;
  };

  const isUserFoundItem = (item: any) => {
    if (item.status !== 'FOUND') return false;
    if (currentUid && item.finderId === currentUid) return true;
    if (currentEmail && item.finderEmail === currentEmail) return true;
    if (user?.name && item.finderName === user.name) return true;
    return false;
  };

  const lostItems = items.filter(isUserLostItem);
  const foundItems = items.filter(isUserFoundItem);
  const pastRecoveries = items.filter((item) => item.status === 'CLAIMED');

  const getTabFilteredItems = () => {
    switch (activeTab) {
      case 'lost': return lostItems;
      case 'found': return foundItems;
      case 'recoveries': return pastRecoveries;
      default: return [...lostItems, ...foundItems, ...pastRecoveries];
    }
  };

  const getFilteredList = () => {
    let list = getTabFilteredItems();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const locMatch = item.location.toLowerCase().includes(q);
        const reportMatch = item.id.toLowerCase().includes(q);
        return nameMatch || locMatch || reportMatch;
      });
    }

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
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100 uppercase">Found / Ready</span>;
      case 'CLAIMED':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100 uppercase">Recovered</span>;
      default:
        return <span className="bg-slate-50 text-slate-650 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-slate-100 uppercase">{status}</span>;
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditLocation(item.location);
    setEditDesc(item.description);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSavingEdit(true);

    try {
      await updateUserItem(editingItem.id, {
        name: editName.trim(),
        location: editLocation.trim(),
        description: editDesc.trim(),
      });
      setEditingItem(null);
    } catch {
      //
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this listing from database?')) {
      await deleteUserItem(itemId);
    }
  };

  const displayName = user?.name || auth.currentUser?.displayName || 'User';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Profile Activity Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">My Activity & Listings</h1>
            <p className="text-xs text-slate-400">Manage, edit, or delete items you have reported lost or found.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/report/lost')}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-brand" />
              Report Lost
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push('/report/found')}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Report Found
            </Button>
          </div>
        </div>

        {/* Real Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lost Reports</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={lostItems.length} />
            </div>
            <span className="text-[9px] text-indigo-500 font-bold block mt-1">Live from database</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Found Reports</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={foundItems.length} />
            </div>
            <span className="text-[9px] text-emerald-500 font-bold block mt-1">Live from database</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recoveries</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={user?.itemsRecovered ?? pastRecoveries.length} />
            </div>
            <span className="text-[9px] text-emerald-500 font-bold block mt-1">Completed</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Transit</span>
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
              <AnimatedNumber value={activeRecovery ? 1 : 0} />
            </div>
            <span className="text-[9px] text-brand font-bold block mt-1">In progress</span>
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
                {tab === 'lost' ? lostItems.length : tab === 'found' ? foundItems.length : tab === 'recoveries' ? pastRecoveries.length : currentList.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content list */}
        {currentList.length === 0 ? (
          <div className="py-16 text-center border border-slate-200 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-white/60">
            <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-950">No reports found</h3>
              <p className="text-xs text-slate-500 max-w-sm px-6">
                You haven&apos;t filed any items in this category yet. Report a lost or found item to see it listed here!
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button size="sm" variant="outline" onClick={() => router.push('/report/lost')}>
                Report Lost Item
              </Button>
              <Button size="sm" variant="primary" onClick={() => router.push('/report/found')}>
                Report Found Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentList.map((item) => (
              <Card
                key={item.id}
                hoverLift={false}
                noPadding
                className="flex flex-col sm:flex-row items-center border border-slate-100 bg-white shadow-xs overflow-hidden"
              >
                {/* Photo preview */}
                <div className="w-full sm:w-36 h-28 flex-shrink-0 bg-slate-50 relative overflow-hidden">
                  <ItemImage
                    src={item.image}
                    alt={item.name}
                    category={item.category}
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
                      <span>Category: {item.category}</span>
                    </div>
                  </div>

                  {/* Actions: View Details, Edit, Delete */}
                  <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/item/${item.id}`)}
                      className="py-1.5 px-3 rounded-lg text-xs"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors text-xs"
                      title="Edit Listing"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors text-xs"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900">Update Report</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <Input
                  label="Item Title"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <Input
                  label="Location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-brand focus:ring-4 focus:ring-indigo-50 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" isLoading={isSavingEdit}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
