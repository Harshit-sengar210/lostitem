'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, ItemStatus, ItemCategory, Notification, ClaimAnswers, INITIAL_ITEMS, INITIAL_NOTIFICATIONS, DeliveryPartner } from '@/data/mockItems';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, orderBy, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase';

interface User {
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  targetRole: 'lost' | 'found' | 'both' | null;
  trustScore: number;
  itemsLost: number;
  itemsFound: number;
  itemsRecovered: number;
  itemsReturned: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface RecoveryAddress {
  fullName: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
}

export interface RecoveryState {
  recoveryId: string | null;
  itemId: string;
  verificationStatus: 'none' | 'pending' | 'success' | 'failed';
  claimStatus: 'none' | 'started' | 'verifying' | 'verified' | 'paid' | 'completed';
  recoveryMethod: 'delivery' | 'pickup' | null;
  deliveryAddress: RecoveryAddress | null;
  paymentStatus: 'pending' | 'completed';
  partnerStatus: 'searching' | 'assigned' | null;
  partner: DeliveryPartner | null;
  trackingStatus: 'partner_assigned' | 'picked_up' | 'in_transit' | 'nearby' | 'arriving' | 'delivered' | 'completed' | null;
  eta: number; // in minutes
  rating: number | null;
  feedback: string | null;
  completedAt: number | null;
}

interface FoundBackContextType {
  items: Item[];
  notifications: Notification[];
  user: User | null;
  userLocation: string | null;
  toasts: Toast[];
  activeRecovery: RecoveryState | null;
  
  loginUser: (name: string, email: string, phone: string, role: 'lost' | 'found' | 'both') => void;
  logoutUser: () => void;
  updateLocation: (loc: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  reportLostItem: (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => Promise<string>;
  reportFoundItem: (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => Promise<string>;
  deleteUserItem: (itemId: string) => Promise<void>;
  updateUserItem: (itemId: string, updates: Partial<Item>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  saveItem: (itemId: string) => void;

  startClaim: (itemId: string) => void;
  submitVerification: (answers: ClaimAnswers) => Promise<boolean>;
  selectRecoveryMethod: (method: 'delivery' | 'pickup') => void;
  saveAddress: (address: RecoveryAddress) => void;
  processPayment: (method: 'UPI' | 'CARD' | 'COD') => void;
  confirmReceived: () => void;
  submitRating: (rating: number, feedback: string) => void;
  resetRecovery: () => void;
}

const FoundBackContext = createContext<FoundBackContextType | undefined>(undefined);

export const FoundBackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeRecovery, setActiveRecovery] = useState<RecoveryState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load of items from Firestore or fallback
  const fetchLiveItems = async () => {
    try {
      const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const liveItems = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Item[];
        setItems(liveItems);
        return;
      }
    } catch (e) {
      console.warn('Firestore items query note (fallback to cached/initial):', e);
    }

    // LocalStorage fallback if offline
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fb_items');
      setItems(stored ? JSON.parse(stored) : INITIAL_ITEMS);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem('fb_notifications');
      const storedLocation = localStorage.getItem('fb_location');
      const storedRecovery = localStorage.getItem('fb_active_recovery');

      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : INITIAL_NOTIFICATIONS);
      setUserLocation(storedLocation || null);
      setActiveRecovery(storedRecovery ? JSON.parse(storedRecovery) : null);
      setIsInitialized(true);
    }
    fetchLiveItems();
  }, []);

  // 2. Firebase auth state listener — auto-restores session on page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const p = snap.data();
            setUser({
              name: p.name ?? firebaseUser.displayName ?? 'User',
              email: p.email ?? firebaseUser.email ?? '',
              phone: p.phone ?? '',
              isLoggedIn: true,
              targetRole: p.targetRole ?? 'both',
              trustScore: p.trustScore ?? 80,
              itemsLost: p.itemsLost ?? 0,
              itemsFound: p.itemsFound ?? 0,
              itemsRecovered: p.itemsRecovered ?? 0,
              itemsReturned: p.itemsReturned ?? 0,
            });
          } else {
            // New account
            const newUserDoc = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName ?? 'User',
              email: firebaseUser.email ?? '',
              phone: '',
              trustScore: 80,
              itemsLost: 0,
              itemsFound: 0,
              itemsRecovered: 0,
              itemsReturned: 0,
              targetRole: 'both',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserDoc, { merge: true });
            setUser({
              name: newUserDoc.name,
              email: newUserDoc.email,
              phone: '',
              isLoggedIn: true,
              targetRole: 'both',
              trustScore: 80,
              itemsLost: 0,
              itemsFound: 0,
              itemsRecovered: 0,
              itemsReturned: 0,
            });
          }
        } catch {
          setUser({
            name: firebaseUser.displayName ?? 'User',
            email: firebaseUser.email ?? '',
            phone: '',
            isLoggedIn: true,
            targetRole: 'both',
            trustScore: 80,
            itemsLost: 0,
            itemsFound: 0,
            itemsRecovered: 0,
            itemsReturned: 0,
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save to LocalStorage when states change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('fb_items', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('fb_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('fb_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('fb_user');
      }
    }
  }, [user, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && userLocation) {
      localStorage.setItem('fb_location', userLocation);
    }
  }, [userLocation, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (activeRecovery) {
        localStorage.setItem('fb_active_recovery', JSON.stringify(activeRecovery));
      } else {
        localStorage.removeItem('fb_active_recovery');
      }
    }
  }, [activeRecovery, isInitialized]);

  // Toast System
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addNotification = (title: string, description: string, link: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      title,
      description,
      time: 'Just now',
      unread: true,
      link,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const loginUser = (name: string, email: string, phone: string, role: 'lost' | 'found' | 'both') => {
    setUser((prev) => ({
      name,
      email,
      phone,
      isLoggedIn: true,
      targetRole: role,
      trustScore: prev?.trustScore ?? 80,
      itemsLost: prev?.itemsLost ?? 0,
      itemsFound: prev?.itemsFound ?? 0,
      itemsRecovered: prev?.itemsRecovered ?? 0,
      itemsReturned: prev?.itemsReturned ?? 0,
    }));
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setActiveRecovery(null);
    localStorage.removeItem('fb_user');
    addToast('Logged out successfully.', 'info');
  };

  const updateLocation = (loc: string) => {
    setUserLocation(loc);
    addToast('Location updated', 'success');
  };

  // ─── REPORT LOST (Firestore + Profile Counter) ───────────────
  const reportLostItem = async (
    itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>
  ): Promise<string> => {
    const currentUid = auth.currentUser?.uid || null;
    const currentUserName = user?.name || auth.currentUser?.displayName || 'You';

    const newDocRef = doc(collection(db, 'items'));
    const newId = newDocRef.id;

    const newItemPayload: any = {
      ...itemData,
      id: newId,
      status: 'LOST',
      distance: 0.5,
      finderName: `${currentUserName} (Lost Report)`,
      reporterId: currentUid,
      reporterEmail: user?.email || auth.currentUser?.email || '',
      finderRating: 5.0,
      isVerified: false,
      deliveryPartner: null,
      address: null,
      paymentMethod: null,
      recoveryId: null,
      timeline: [
        { status: 'Lost Report Filed', time: 'Just now', completed: true },
        { status: 'Matching Search Active', time: 'Ongoing', completed: false }
      ],
      claimAnswers: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 1. Save to Firestore
    try {
      await setDoc(newDocRef, newItemPayload);
      if (currentUid) {
        await updateDoc(doc(db, 'users', currentUid), {
          itemsLost: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Error saving lost item to Firestore, saving locally:', err);
    }

    // 2. Update local app state
    setItems((prev) => [newItemPayload as Item, ...prev]);
    setUser((prev) => (prev ? { ...prev, itemsLost: (prev.itemsLost || 0) + 1 } : null));

    addNotification('Lost Item Reported', `Your report for "${itemData.name}" has been registered.`, `/item/${newId}`);
    addToast('Lost item report saved to database! 🚀', 'success');
    return newId;
  };

  // ─── REPORT FOUND (Firestore + Profile Counter) ──────────────
  const reportFoundItem = async (
    itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>
  ): Promise<string> => {
    const currentUid = auth.currentUser?.uid || null;
    const currentUserName = user?.name || auth.currentUser?.displayName || 'Verified Finder';

    const newDocRef = doc(collection(db, 'items'));
    const newId = newDocRef.id;

    const newItemPayload: any = {
      ...itemData,
      id: newId,
      status: 'FOUND',
      distance: 1.2,
      finderName: currentUserName,
      finderId: currentUid,
      finderEmail: user?.email || auth.currentUser?.email || '',
      finderRating: 5.0,
      isVerified: true,
      deliveryPartner: null,
      address: null,
      paymentMethod: null,
      recoveryId: null,
      timeline: [
        { status: 'Item Found & Verified', time: 'Just now', completed: true },
        { status: 'Awaiting Owner Claim', time: 'Ready', completed: false }
      ],
      claimAnswers: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, newItemPayload);
      if (currentUid) {
        await updateDoc(doc(db, 'users', currentUid), {
          itemsFound: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Error saving found item to Firestore, saving locally:', err);
    }

    setItems((prev) => [newItemPayload as Item, ...prev]);
    setUser((prev) => (prev ? { ...prev, itemsFound: (prev.itemsFound || 0) + 1 } : null));

    addNotification('Found Item Reported', `Found report for "${itemData.name}" is submitted.`, `/item/${newId}`);
    addToast('Found item listed in database! 🎉', 'success');
    return newId;
  };

  // ─── DELETE USER ITEM (Firestore + Local) ────────────────────
  const deleteUserItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'items', itemId));
    } catch (err) {
      console.warn('Could not delete from Firestore:', err);
    }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    addToast('Report deleted.', 'info');
  };

  // ─── UPDATE USER ITEM ─────────────────────────────────────────
  const updateUserItem = async (itemId: string, updates: Partial<Item>) => {
    try {
      await updateDoc(doc(db, 'items', itemId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not update in Firestore:', err);
    }
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...updates } : it)));
    addToast('Listing updated successfully.', 'success');
  };

  const saveItem = (itemId: string) => {
    addToast('Item saved', 'success');
  };

  // Recovery hooks
  const startClaim = (itemId: string) => {
    setActiveRecovery({
      recoveryId: `rec-${Date.now()}`,
      itemId,
      verificationStatus: 'none',
      claimStatus: 'started',
      recoveryMethod: null,
      deliveryAddress: null,
      paymentStatus: 'pending',
      partnerStatus: null,
      partner: null,
      trackingStatus: null,
      eta: 30,
      rating: null,
      feedback: null,
      completedAt: null,
    });
  };

  const submitVerification = async (answers: ClaimAnswers): Promise<boolean> => {
    if (!activeRecovery) return false;
    setActiveRecovery((prev) => (prev ? { ...prev, claimStatus: 'verifying' } : null));

    return new Promise((resolve) => {
      setTimeout(() => {
        const isMatched = answers.color.trim().length > 1;
        if (isMatched) {
          setActiveRecovery((prev) =>
            prev ? { ...prev, verificationStatus: 'success', claimStatus: 'verified' } : null
          );
          addToast('Verification successful! You can now claim your item.', 'success');
          resolve(true);
        } else {
          setActiveRecovery((prev) =>
            prev ? { ...prev, verificationStatus: 'failed', claimStatus: 'started' } : null
          );
          addToast('Verification answers do not match the report.', 'error');
          resolve(false);
        }
      }, 1500);
    });
  };

  const selectRecoveryMethod = (method: 'delivery' | 'pickup') => {
    setActiveRecovery((prev) => (prev ? { ...prev, recoveryMethod: method } : null));
  };

  const saveAddress = (address: RecoveryAddress) => {
    setActiveRecovery((prev) => (prev ? { ...prev, deliveryAddress: address } : null));
    addToast('Delivery address saved', 'success');
  };

  const processPayment = (method: 'UPI' | 'CARD' | 'COD') => {
    if (!activeRecovery) return;
    setActiveRecovery((prev) =>
      prev
        ? {
            ...prev,
            paymentStatus: 'completed',
            claimStatus: 'paid',
            partnerStatus: 'searching',
            trackingStatus: 'partner_assigned',
            eta: 28,
            partner: {
              name: 'Arjun Kumar',
              rating: 4.9,
              vehicle: 'Honda Activa (DL 8S 4120)',
              eta: 28,
            },
          }
        : null
    );
    addToast('Payment confirmed! Courier dispatched.', 'success');
  };

  const confirmReceived = () => {
    if (!activeRecovery) return;
    const currentUid = auth.currentUser?.uid;

    if (currentUid) {
      updateDoc(doc(db, 'users', currentUid), {
        itemsRecovered: increment(1),
        updatedAt: serverTimestamp(),
      }).catch(console.warn);
    }

    setActiveRecovery((prev) =>
      prev ? { ...prev, claimStatus: 'completed', trackingStatus: 'completed', completedAt: Date.now() } : null
    );
    setUser((prev) => (prev ? { ...prev, itemsRecovered: (prev.itemsRecovered || 0) + 1 } : null));
    addToast('Recovery marked completed! 🎉', 'success');
  };

  const submitRating = (rating: number, feedback: string) => {
    if (!activeRecovery) return;
    setActiveRecovery((prev) => (prev ? { ...prev, rating, feedback } : null));
    addToast('Thank you for rating your experience!', 'success');
  };

  const resetRecovery = () => {
    setActiveRecovery(null);
  };

  return (
    <FoundBackContext.Provider
      value={{
        items,
        notifications,
        user,
        userLocation,
        toasts,
        activeRecovery,
        loginUser,
        logoutUser,
        updateLocation,
        addToast,
        removeToast,
        reportLostItem,
        reportFoundItem,
        deleteUserItem,
        updateUserItem,
        markNotificationRead,
        clearNotifications,
        saveItem,
        startClaim,
        submitVerification,
        selectRecoveryMethod,
        saveAddress,
        processPayment,
        confirmReceived,
        submitRating,
        resetRecovery,
      }}
    >
      {children}
    </FoundBackContext.Provider>
  );
};

export const useFoundBack = () => {
  const context = useContext(FoundBackContext);
  if (!context) {
    throw new Error('useFoundBack must be used within a FoundBackProvider');
  }
  return context;
};
