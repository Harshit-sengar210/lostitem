'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  PlusCircle,
  Activity,
  User,
  Bell,
  MapPin,
  LogOut,
  ChevronDown,
  Info,
  Check,
  Plus
} from 'lucide-react';
import { useFoundBack } from '@/components/FoundBackProvider';
import { Logo } from '@/app/page';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userLocation, notifications, markNotificationRead, clearNotifications, logoutUser } = useFoundBack();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileReportModal, setShowMobileReportModal] = useState(false);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/report/lost', label: 'Report Lost', icon: PlusCircle, isAction: true },
    { href: '/report/found', label: 'Report Found', icon: PlusCircle, isAction: true },
    { href: '/activity', label: 'My Activity', icon: Activity },
  ];

  return (
    <>
      {/* ==================================================
          DESKTOP HEADER NAVBAR
          ================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0">
              <Logo className="text-brand" size={32} />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">FoundBack</span>
            </Link>
            
            <Link href="/location" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <span className="truncate max-w-[140px]">{userLocation || 'Set Location'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Link>
          </div>

          {/* Center Search bar suggestion */}
          <div 
            onClick={() => router.push('/explore')} 
            className="flex-grow max-w-md h-10 border border-slate-200 bg-slate-50 rounded-xl px-3.5 flex items-center gap-2.5 text-slate-400 hover:border-slate-300 hover:bg-slate-100/50 transition-colors cursor-pointer select-none"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Search lost items, phones, wallets, keys...</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5">
            <Link href="/home" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/home' ? 'text-brand bg-brand-light' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
              Home
            </Link>
            <Link href="/explore" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/explore' ? 'text-brand bg-brand-light' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
              Explore
            </Link>
            <Link href="/report/lost" className="px-3.5 py-2 text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 transition-all">
              Report Lost
            </Link>
            <Link href="/report/found" className="px-3.5 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 transition-all">
              Report Found
            </Link>
            <Link href="/activity" className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/activity' ? 'text-brand bg-brand-light' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
              My Activity
            </Link>
          </nav>

          {/* Notifications and Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Bell trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className={`p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50 relative ${
                  showNotifications ? 'bg-slate-100 border-slate-200' : 'bg-white'
                }`}
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                )}
              </button>

              {/* Notification Overlay dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Notifications</span>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-[10px] font-bold text-brand hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 4).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              setShowNotifications(false);
                              router.push(notif.link);
                            }}
                            className={`p-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer flex gap-3 text-left ${
                              notif.unread ? 'bg-indigo-50/20' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand flex items-center justify-center flex-shrink-0">
                              <Info className="w-4 h-4" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start gap-1">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                                <span className="text-[9px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{notif.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            router.push('/notifications');
                          }}
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-800 hover:underline w-full py-1.5 focus:outline-none"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                  {user ? user.name.split(' ').map((n) => n[0]).join('') : 'U'}
                </div>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 text-left">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      View Profile
                    </Link>
                    <Link
                      href="/activity"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-slate-400" />
                      Track Items
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* ==================================================
          MOBILE NAVIGATION BOTTOM BAR
          ================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-100 py-2.5 px-6 flex justify-between items-center md:hidden shadow-lg shadow-black/5">
        <Link href="/home" className={`flex flex-col items-center gap-1 transition-all ${
          pathname === '/home' ? 'text-brand scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Home className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">Home</span>
        </Link>

        <Link href="/explore" className={`flex flex-col items-center gap-1 transition-all ${
          pathname === '/explore' ? 'text-brand scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Search className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">Explore</span>
        </Link>

        {/* Floating Report Button */}
        <button
          onClick={() => setShowMobileReportModal(true)}
          className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 -mt-6 focus:outline-none hover:bg-brand-hover active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <Link href="/activity" className={`flex flex-col items-center gap-1 transition-all ${
          pathname === '/activity' ? 'text-brand scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Activity className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">Activity</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-all ${
          pathname === '/profile' ? 'text-brand scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <User className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">Profile</span>
        </Link>
      </nav>

      {/* Mobile Report Modal/Overlay */}
      <AnimatePresence>
        {showMobileReportModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileReportModal(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 md:hidden border-t border-slate-100 flex flex-col gap-5 shadow-2xl"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
              
              <div className="text-center">
                <h3 className="text-base font-extrabold text-slate-900">What would you like to do?</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Choose an option below to list your item.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-2">
                <Link
                  href="/report/lost"
                  onClick={() => setShowMobileReportModal(false)}
                  className="flex flex-col items-center gap-3 p-4 border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-brand flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-900">Report Lost Item</span>
                </Link>

                <Link
                  href="/report/found"
                  onClick={() => setShowMobileReportModal(false)}
                  className="flex flex-col items-center gap-3 p-4 border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-2xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950">Report Found Item</span>
                </Link>
              </div>

              <button
                onClick={() => setShowMobileReportModal(false)}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close Menu
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
