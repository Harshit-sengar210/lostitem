'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldCheck, CreditCard, Truck, Smartphone, MapPin, Info, ArrowLeft, Trash2, Eye, Award, Compass } from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markNotificationRead, clearNotifications, addToast } = useFoundBack();
  
  const [activeTab, setActiveTab] = useState<'all' | 'recovery' | 'items' | 'system'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    notifications.forEach((notif) => {
      if (notif.unread) markNotificationRead(notif.id);
    });
    addToast('All notifications marked as read', 'success');
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    
    return notifications.filter((n) => {
      const title = n.title.toLowerCase();
      const desc = n.description.toLowerCase();
      
      if (activeTab === 'recovery') {
        return title.includes('recovery') || title.includes('rider') || title.includes('payment') || title.includes('transit') || title.includes('delivery') || title.includes('verification');
      }
      if (activeTab === 'items') {
        return title.includes('item') || title.includes('report') || title.includes('match') || desc.includes('found near');
      }
      if (activeTab === 'system') {
        return title.includes('location') || title.includes('profile') || title.includes('system') || title.includes('logged');
      }
      return true;
    });
  };

  const currentList = getFilteredNotifications();

  // Retrieve matching icons based on notification title
  const getNotificationIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('verification') || t.includes('verified')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
    if (t.includes('payment') || t.includes('paid')) {
      return <CreditCard className="w-4 h-4 text-emerald-600" />;
    }
    if (t.includes('rider') || t.includes('delivery') || t.includes('picked') || t.includes('transit')) {
      return <Truck className="w-4 h-4 text-brand" />;
    }
    if (t.includes('location') || t.includes('updated')) {
      return <MapPin className="w-4 h-4 text-indigo-650" />;
    }
    if (t.includes('match') || t.includes('found near')) {
      return <Compass className="w-4 h-4 text-brand" />;
    }
    return <Info className="w-4 h-4 text-slate-500" />;
  };

  const getTabCount = (tab: 'all' | 'recovery' | 'items' | 'system') => {
    if (tab === 'all') return notifications.length;
    
    return notifications.filter((n) => {
      const title = n.title.toLowerCase();
      const desc = n.description.toLowerCase();
      if (tab === 'recovery') {
        return title.includes('recovery') || title.includes('rider') || title.includes('payment') || title.includes('transit') || title.includes('delivery') || title.includes('verification');
      }
      if (tab === 'items') {
        return title.includes('item') || title.includes('report') || title.includes('match') || desc.includes('found near');
      }
      return title.includes('location') || title.includes('profile') || title.includes('system') || title.includes('logged');
    }).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 text-left">
        
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-150 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">Stay updated on your reports, recoveries, and system events.</p>
          </div>

          <div className="flex gap-2.5 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-650 hover:text-slate-800 rounded-xl transition-all focus:outline-none"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="px-3.5 py-2 border border-red-200/60 hover:bg-red-50 text-[10px] font-bold text-red-600 rounded-xl transition-all focus:outline-none"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Categories Tabs Selector */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto select-none">
          {(['all', 'recovery', 'items', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all relative flex items-center gap-1.5 focus:outline-none ${
                activeTab === tab
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Alerts' : tab === 'recovery' ? 'Recoveries' : tab === 'items' ? 'Matches & Reports' : 'System'}
              <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab ? 'bg-indigo-50 text-brand' : 'bg-slate-100 text-slate-500'
              }`}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications Listing panel */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" className="space-y-3.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-2xl p-4.5 h-16 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : currentList.length === 0 ? (
            <motion.div
              key="empty-notifs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center border border-slate-200 border-dashed rounded-3xl flex flex-col items-center gap-4 bg-white/40"
            >
              <div className="p-4 bg-indigo-50 text-brand rounded-2xl">
                <Bell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-950">Inbox clean</h3>
                <p className="text-xs text-slate-500 max-w-sm px-6">
                  No notifications found in this category. Live updates will notify you here.
                </p>
              </div>
              <Button variant="primary" onClick={() => router.push('/home')} className="mt-2 py-2 px-4 rounded-xl text-xs font-bold">
                Go to Homepage
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="alerts-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {currentList.map((notif) => (
                <Card
                  key={notif.id}
                  hoverLift={false}
                  noPadding
                  className={`border border-slate-100 bg-white transition-all cursor-pointer relative overflow-hidden rounded-2xl ${
                    notif.unread ? 'bg-indigo-50/20 shadow-xs border-indigo-100/50' : 'opacity-85 hover:opacity-100'
                  }`}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.link) {
                      router.push(notif.link);
                    }
                  }}
                >
                  <div className="p-4 flex gap-3.5 items-start text-left">
                    {/* Unread circle pulse */}
                    {notif.unread && (
                      <span className="absolute top-4.5 right-4.5 w-2 h-2 bg-brand rounded-full animate-pulse" />
                    )}

                    {/* Icon frame */}
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notif.title)}
                    </div>

                    <div className="flex-grow min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className={`text-xs text-slate-900 truncate ${notif.unread ? 'font-extrabold' : 'font-bold'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{notif.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
