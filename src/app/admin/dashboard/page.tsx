'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  History,
  Shield,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  LogOut,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Save,
  Check,
  Calendar
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/backend/firebase';
import { Item, ItemStatus } from '@/data/mockItems';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FirestoreUser {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  phone?: string;
  trustScore?: number;
  itemsLost?: number;
  itemsFound?: number;
  itemsRecovered?: number;
  itemsReturned?: number;
  targetRole?: string;
  createdAt?: any;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('fb_admin_auth');
      if (!isAuth) {
        router.push('/admin');
      }
    }
  }, [router]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'users' | 'deliveries' | 'history'>('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [usersList, setUsersList] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editStatus, setEditStatus] = useState<ItemStatus>('LOST');
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    // 1. Live Items listener
    const itemsRef = collection(db, 'items');
    const unsubscribeItems = onSnapshot(itemsRef, (snapshot) => {
      const fetchedItems: Item[] = [];
      snapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(fetchedItems);
      setLoading(false);
    }, (err) => {
      console.warn('Realtime items sync note:', err);
      setLoading(false);
    });

    // 2. Live Users listener
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers: FirestoreUser[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(fetchedUsers);
    }, (err) => {
      console.warn('Realtime users sync note:', err);
    });

    return () => {
      unsubscribeItems();
      unsubscribeUsers();
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('fb_admin_auth');
    }
    router.push('/admin');
  };

  // Status counters
  const totalLost = items.filter((i) => i.status === 'LOST').length;
  const totalFound = items.filter((i) => i.status === 'FOUND').length;
  const totalClaimed = items.filter((i) => i.status === 'CLAIMED' || i.status === 'DELIVERED').length;
  const activeTransit = items.filter((i) => i.status === 'IN_TRANSIT' || i.status === 'PICKED_UP').length;

  // Actions
  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Permanently delete this item listing from database?')) {
      try {
        await deleteDoc(doc(db, 'items', itemId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleQuickStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    try {
      await updateDoc(doc(db, 'items', itemId), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditLocation(item.location);
    setEditStatus(item.status);
  };

  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'items', editingItem.id), {
        name: editName.trim(),
        location: editLocation.trim(),
        status: editStatus,
        updatedAt: new Date(),
      });
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered items list for Table view
  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || it.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row text-left font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ─── SIDEBAR ────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white leading-none">FoundBack</h2>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">Admin Suite</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected Live" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
              { id: 'items', label: 'Item Listings & Verification', icon: Package, badge: items.length },
              { id: 'users', label: 'Registered Users', icon: Users, badge: usersList.length },
              { id: 'deliveries', label: 'Live Track & Dispatch', icon: Truck, badge: activeTransit },
              { id: 'history', label: 'Recovery History', icon: History, badge: totalClaimed },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-indigo-700/60 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Public Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out Admin
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Console &bull;</span>
            <span className="text-xs font-bold text-indigo-400 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              Real-time Firestore: <strong className="text-emerald-400">Synced</strong>
            </span>
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700"
            >
              Public App
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* ══════════════════════════════════════════════════════
              VIEW 1: OVERVIEW DASHBOARD
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Metrics & Activity</h1>
                <p className="text-xs text-slate-400 mt-1">Live overview of platform items, deliveries, and verified recoveries.</p>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Lost Items</span>
                    <Package className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-white">{totalLost}</span>
                    <span className="text-[10px] text-indigo-400 font-bold block mt-1">Searching in Delhi NCR</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Items Found</span>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-white">{totalFound}</span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">Ready for Claim</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Recovered</span>
                    <History className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-white">{totalClaimed}</span>
                    <span className="text-[10px] text-purple-400 font-bold block mt-1">Returned to Owners</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-white">{usersList.length}</span>
                    <span className="text-[10px] text-amber-400 font-bold block mt-1">In Firestore Auth</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Items Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Items */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Item Activity</h3>
                    <button
                      onClick={() => setActiveTab('items')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View All ({items.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {items.slice(0, 5).map((it) => (
                      <div key={it.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.image} alt={it.name} className="w-10 h-10 rounded-xl object-cover bg-slate-800 flex-shrink-0" />
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white truncate">{it.name}</h4>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {it.location}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            it.status === 'FOUND' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            it.status === 'LOST' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {it.status}
                          </span>
                          <button
                            onClick={() => openEditModal(it)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Diagnostics Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Health</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Cloud Firestore</span>
                        <span className="text-[10px] text-slate-400">found-back16.firebaseapp.com</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Online
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Cloudinary CDN</span>
                        <span className="text-[10px] text-slate-400">cloud: found-back</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Active
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Dispatch Network</span>
                        <span className="text-[10px] text-slate-400">Delhi NCR Couriers</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 2: ITEMS LISTINGS & VERIFICATION MANAGEMENT
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'items' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Database Item Listings</h1>
                  <p className="text-xs text-slate-400 mt-1">Review, modify status, verify ownership or delete listings live.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search title, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="ALL">All Status</option>
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                    <option value="CLAIMED">Claimed</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Location & Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Private Key</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                            No item records match this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover bg-slate-800 flex-shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-white truncate max-w-[180px]">{item.name}</h4>
                                <span className="text-[10px] text-slate-500 font-mono block">ID: {item.id.slice(0, 8)}...</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-300 font-medium capitalize">
                              {item.category}
                            </td>

                            <td className="py-3 px-4 text-slate-400">
                              <span className="text-white block truncate max-w-[160px]">{item.location}</span>
                              <span className="text-[10px] text-slate-500">{item.date}</span>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={item.status}
                                onChange={(e) => handleQuickStatusChange(item.id, e.target.value as ItemStatus)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border focus:outline-none transition-colors ${
                                  item.status === 'FOUND' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                  item.status === 'LOST' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                                  'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                }`}
                              >
                                <option value="LOST" className="bg-slate-900 text-white">LOST</option>
                                <option value="FOUND" className="bg-slate-900 text-white">FOUND</option>
                                <option value="CLAIMED" className="bg-slate-900 text-white">CLAIMED</option>
                                <option value="IN_TRANSIT" className="bg-slate-900 text-white">IN_TRANSIT</option>
                                <option value="DELIVERED" className="bg-slate-900 text-white">DELIVERED</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-[180px] truncate" title={item.uniqueDetails}>
                              {item.uniqueDetails || 'None'}
                            </td>

                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => router.push(`/item/${item.id}`)}
                                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                                title="Public View"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-lg"
                                title="Edit Item"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 3: REGISTERED USERS MANAGEMENT
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Registered Member Accounts</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Live Firestore user profiles registered via Email/Password and Google OAuth.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Role Preference</th>
                        <th className="py-3 px-4">Trust Score</th>
                        <th className="py-3 px-4">Items Reported</th>
                        <th className="py-3 px-4">Recoveries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No users registered in database yet.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-xs">
                                  {u.name ? u.name[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <span className="font-bold text-white block">{u.name || 'User'}</span>
                                  <span className="text-[11px] text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-300 font-mono">
                              {u.phone || 'Not provided'}
                            </td>

                            <td className="py-3 px-4 capitalize">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {u.targetRole || 'both'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                {u.trustScore ?? 80}%
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-300 font-bold">
                              Lost: {u.itemsLost ?? 0} &bull; Found: {u.itemsFound ?? 0}
                            </td>

                            <td className="py-3 px-4 text-emerald-400 font-bold">
                              {u.itemsRecovered ?? 0}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 4: LIVE DELIVERIES & DISPATCH
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'deliveries' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Active Deliveries & Courier Dispatch</h1>
                <p className="text-xs text-slate-400 mt-1">Live tracking of courier partners across Delhi NCR.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items
                  .filter((it) => it.status === 'IN_TRANSIT' || it.status === 'PICKED_UP' || it.deliveryPartner)
                  .map((it) => (
                    <div key={it.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-white truncate">{it.name}</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {it.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-800/60 text-xs space-y-1">
                        <div className="text-slate-400">Assigned Partner: <strong className="text-white">{it.deliveryPartner?.name || 'Arjun Kumar'}</strong></div>
                        <div className="text-slate-400">Vehicle: <span className="text-slate-300">{it.deliveryPartner?.vehicle || 'Honda Activa'}</span></div>
                        <div className="text-slate-400">ETA: <strong className="text-emerald-400">{it.deliveryPartner?.eta || 25} mins</strong></div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleQuickStatusChange(it.id, 'DELIVERED')}
                          className="w-full text-xs"
                        >
                          Mark Delivered
                        </Button>
                      </div>
                    </div>
                  ))}

                {items.filter((it) => it.status === 'IN_TRANSIT' || it.status === 'PICKED_UP').length === 0 && (
                  <div className="col-span-2 py-16 text-center border border-slate-800 border-dashed rounded-3xl text-slate-500 space-y-2">
                    <Truck className="w-8 h-8 mx-auto text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-400">No active dispatches currently in transit</h3>
                    <p className="text-xs text-slate-600">When an owner completes claim payment, the courier dispatch shows here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 5: RECOVERY HISTORY
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Completed Recovery Log</h1>
                <p className="text-xs text-slate-400 mt-1">Full audit trail of recovered items returned safely to verified owners.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="divide-y divide-slate-800">
                  {items.filter((i) => i.status === 'CLAIMED' || i.status === 'DELIVERED').map((it) => (
                    <div key={it.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{it.name}</h4>
                          <span className="text-[11px] text-slate-400 block">{it.location} &bull; {it.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Recovered
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">Verified Delivery</span>
                      </div>
                    </div>
                  ))}

                  {items.filter((i) => i.status === 'CLAIMED' || i.status === 'DELIVERED').length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No completed recoveries logged in database yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ─── EDIT ITEM MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-800 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Edit Listing (Admin)</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItemEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Item Title</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Listing Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ItemStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="LOST">LOST</option>
                    <option value="FOUND">FOUND</option>
                    <option value="CLAIMED">CLAIMED</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    isLoading={isUpdating}
                  >
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

