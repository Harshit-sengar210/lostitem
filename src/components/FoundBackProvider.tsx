'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, ItemStatus, ItemCategory, Notification, ClaimAnswers, INITIAL_ITEMS, INITIAL_NOTIFICATIONS, DeliveryPartner } from '@/data/mockItems';

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
  
  // Existing auth & location hooks
  loginUser: (name: string, email: string, phone: string, role: 'lost' | 'found' | 'both') => void;
  logoutUser: () => void;
  updateLocation: (loc: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  reportLostItem: (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => string;
  reportFoundItem: (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => string;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  saveItem: (itemId: string) => void;

  // New Phase 4, 5, 6 Recovery hooks
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

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('fb_items');
      const storedNotifications = localStorage.getItem('fb_notifications');
      const storedUser = localStorage.getItem('fb_user');
      const storedLocation = localStorage.getItem('fb_location');
      const storedRecovery = localStorage.getItem('fb_active_recovery');

      setItems(storedItems ? JSON.parse(storedItems) : INITIAL_ITEMS);
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : INITIAL_NOTIFICATIONS);
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : {
              name: 'Arpit Goyal',
              email: 'arpit@foundback.com',
              phone: '+91 98765 43210',
              isLoggedIn: true,
              targetRole: 'both',
              trustScore: 96,
              itemsLost: 3,
              itemsFound: 1,
              itemsRecovered: 1,
              itemsReturned: 1,
            }
      );
      setUserLocation(storedLocation || 'Ghaziabad, NCR');
      setActiveRecovery(storedRecovery ? JSON.parse(storedRecovery) : null);
      setIsInitialized(true);
    }
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
    if (isInitialized && typeof window !== 'undefined') {
      if (userLocation) {
        localStorage.setItem('fb_location', userLocation);
      } else {
        localStorage.removeItem('fb_location');
      }
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

  // Live simulation of delivery tracking states
  useEffect(() => {
    if (!activeRecovery || activeRecovery.claimStatus !== 'paid' || activeRecovery.recoveryMethod !== 'delivery') return;

    let timer: NodeJS.Timeout;

    const advanceSimulation = () => {
      setActiveRecovery((prev) => {
        if (!prev) return null;

        // 1. Searching -> Partner Assigned
        if (prev.partnerStatus === 'searching') {
          addToast('Delivery partner assigned!', 'success');
          addNotification(
            'Rider Assigned',
            'Arjun Kumar has been assigned to your recovery.',
            `/tracking/${prev.itemId}`
          );
          return {
            ...prev,
            partnerStatus: 'assigned',
            partner: {
              name: 'Arjun Kumar',
              rating: 4.9,
              vehicle: 'Honda Activa (Electric) - UP 14 AB 4821',
              eta: 24,
            },
            trackingStatus: 'partner_assigned',
            eta: 24,
          };
        }

        // 2. Partner Assigned -> Picked Up
        if (prev.trackingStatus === 'partner_assigned') {
          addToast('Arjun has picked up your item.', 'info');
          addNotification(
            'Item Picked Up',
            'Your item has been picked up by Arjun Kumar.',
            `/tracking/${prev.itemId}`
          );
          return {
            ...prev,
            trackingStatus: 'picked_up',
            eta: 20,
          };
        }

        // 3. Picked Up -> In Transit
        if (prev.trackingStatus === 'picked_up') {
          addToast('Your item is on the way.', 'info');
          addNotification(
            'Delivery in Transit',
            'Your recovery is currently on the way.',
            `/tracking/${prev.itemId}`
          );
          return {
            ...prev,
            trackingStatus: 'in_transit',
            eta: 14,
          };
        }

        // 4. In Transit -> Nearby
        if (prev.trackingStatus === 'in_transit') {
          addToast('Your delivery partner is nearby.', 'info');
          addNotification(
            'Rider Nearby',
            'Arjun Kumar is within 1 km of your address.',
            `/tracking/${prev.itemId}`
          );
          return {
            ...prev,
            trackingStatus: 'nearby',
            eta: 5,
          };
        }

        // 5. Nearby -> Arriving
        if (prev.trackingStatus === 'nearby') {
          addToast('Your item has arrived.', 'success');
          addNotification(
            'Rider Arrived',
            'Arjun Kumar has arrived at your address.',
            `/tracking/${prev.itemId}`
          );
          return {
            ...prev,
            trackingStatus: 'arriving',
            eta: 1,
          };
        }

        // 6. Arriving -> Delivered
        if (prev.trackingStatus === 'arriving') {
          addToast('Recovery delivered successfully!', 'success');
          addNotification(
            'Item Delivered',
            'Your item has been marked as delivered. Confirm receipt.',
            `/tracking/${prev.itemId}`
          );
          
          // Also update global item status in search database to CLAIMED
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === prev.itemId ? { ...item, status: 'CLAIMED' } : item
            )
          );

          return {
            ...prev,
            trackingStatus: 'delivered',
            eta: 0,
          };
        }

        return prev;
      });
    };

    // Trigger state changes every 8 seconds for quick demo purposes
    timer = setInterval(advanceSimulation, 8000);

    return () => clearInterval(timer);
  }, [activeRecovery?.claimStatus, activeRecovery?.partnerStatus, activeRecovery?.trackingStatus]);

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

  // Auth Operations
  const loginUser = (name: string, email: string, phone: string, role: 'lost' | 'found' | 'both') => {
    const newUser: User = {
      name,
      email,
      phone,
      isLoggedIn: true,
      targetRole: role,
      trustScore: 96,
      itemsLost: role === 'lost' || role === 'both' ? 1 : 0,
      itemsFound: role === 'found' || role === 'both' ? 1 : 0,
      itemsRecovered: 1,
      itemsReturned: 1,
    };
    setUser(newUser);
    addToast('Welcome to FoundBack', 'success');
  };

  const logoutUser = () => {
    setUser(null);
    setActiveRecovery(null);
    addToast('Logged out successfully.', 'info');
  };

  const updateLocation = (loc: string) => {
    setUserLocation(loc);
    addToast('Location updated', 'success');
  };

  // Report Operations
  const reportLostItem = (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => {
    const newId = `item-${Date.now()}`;
    const newItem: Item = {
      ...itemData,
      id: newId,
      status: 'LOST',
      distance: parseFloat((Math.random() * 3).toFixed(1)),
      finderName: 'You (Lost Report)',
      finderRating: 5.0,
      isVerified: false,
      deliveryPartner: null,
      address: null,
      paymentMethod: null,
      recoveryId: null,
      timeline: [],
      claimAnswers: null,
    };

    setItems((prev) => [newItem, ...prev]);
    addNotification('Lost Item Reported', `Your report for "${itemData.name}" has been submitted.`, `/item/${newId}`);
    addToast('Item reported successfully', 'success');
    return newId;
  };

  const reportFoundItem = (itemData: Omit<Item, 'id' | 'status' | 'distance' | 'finderName' | 'finderRating' | 'isVerified' | 'deliveryPartner' | 'address' | 'paymentMethod' | 'recoveryId' | 'timeline' | 'claimAnswers'>) => {
    const newId = `item-${Date.now()}`;
    const newItem: Item = {
      ...itemData,
      id: newId,
      status: 'FOUND',
      distance: parseFloat((Math.random() * 3).toFixed(1)),
      finderName: user?.name || 'Verified Founder',
      finderRating: 4.9,
      isVerified: true,
      deliveryPartner: null,
      address: null,
      paymentMethod: null,
      recoveryId: null,
      timeline: [],
      claimAnswers: null,
    };

    setItems((prev) => [newItem, ...prev]);
    addNotification('Found Item Reported', `Thank you! Found report for "${itemData.name}" is submitted.`, `/item/${newId}`);
    addToast('Item reported successfully', 'success');
    return newId;
  };

  const saveItem = (itemId: string) => {
    // Toggle save status on item description or local list
    addToast('Item saved', 'success');
  };

  // ==================================================
  // RECOVERY FLOW HOOKS (PHASE 4, 5, 6)
  // ==================================================

  const startClaim = (itemId: string) => {
    setActiveRecovery({
      recoveryId: null,
      itemId,
      verificationStatus: 'none',
      claimStatus: 'started',
      recoveryMethod: null,
      deliveryAddress: null,
      paymentStatus: 'pending',
      partnerStatus: null,
      partner: null,
      trackingStatus: null,
      eta: 0,
      rating: null,
      feedback: null,
      completedAt: null,
    });
  };

  const submitVerification = async (answers: ClaimAnswers): Promise<boolean> => {
    if (!activeRecovery) return false;

    setActiveRecovery((prev) => prev ? { ...prev, verificationStatus: 'pending', claimStatus: 'verifying' } : null);
    
    // Simulate verification check matching against seed database values
    const targetItem = items.find((i) => i.id === activeRecovery.itemId);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple comparison check: fails only if unique detail is left completely blank or has 'fail'
        const isSuccessful = answers.uniqueDetail.trim().length > 3 && !answers.uniqueDetail.toLowerCase().includes('fail');
        
        if (isSuccessful) {
          setActiveRecovery((prev) =>
            prev
              ? {
                  ...prev,
                  verificationStatus: 'success',
                  claimStatus: 'verified',
                }
              : null
          );
          addToast('Your ownership verification passed.', 'success');
          addNotification(
            'Verification Passed',
            `Your claim for "${targetItem?.name}" has been verified successfully.`,
            `/recovery/${activeRecovery.itemId}`
          );
          resolve(true);
        } else {
          setActiveRecovery((prev) =>
            prev
              ? {
                  ...prev,
                  verificationStatus: 'failed',
                  claimStatus: 'none',
                }
              : null
          );
          addToast('Ownership verification failed', 'error');
          resolve(false);
        }
      }, 3000);
    });
  };

  const selectRecoveryMethod = (method: 'delivery' | 'pickup') => {
    setActiveRecovery((prev) => prev ? { ...prev, recoveryMethod: method } : null);
  };

  const saveAddress = (address: RecoveryAddress) => {
    setActiveRecovery((prev) => prev ? { ...prev, deliveryAddress: address } : null);
    addToast('Address updated', 'success');
  };

  const processPayment = (method: 'UPI' | 'CARD' | 'COD') => {
    if (!activeRecovery) return;

    const rId = `FB-REC-${Math.floor(10000 + Math.random() * 90000)}`;

    setActiveRecovery((prev) => {
      if (!prev) return null;

      // Update matching item status in items database to CLAIMED
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === prev.itemId
            ? { ...item, status: 'CLAIMED', paymentMethod: method, recoveryId: rId }
            : item
        )
      );

      // Trigger radar and delivery rider search state
      return {
        ...prev,
        recoveryId: rId,
        paymentStatus: 'completed',
        claimStatus: 'paid',
        partnerStatus: 'searching', // triggers Radar Search view
      };
    });

    addToast('Payment successful.', 'success');
    addNotification('Payment Confirmed', `Recovery request for item is confirmed. ID: ${rId}`, `/tracking/${activeRecovery.itemId}`);
  };

  const confirmReceived = () => {
    setActiveRecovery((prev) =>
      prev
        ? {
            ...prev,
            trackingStatus: 'completed',
            claimStatus: 'completed',
            completedAt: Date.now(),
          }
        : null
    );

    // Update user stats
    setUser((prev) =>
      prev
        ? {
            ...prev,
            itemsRecovered: prev.itemsRecovered + 1,
            trustScore: Math.min(prev.trustScore + 2, 100),
          }
        : null
    );

    addToast('Report marked as complete', 'success');
  };

  const submitRating = (rating: number, feedback: string) => {
    setActiveRecovery((prev) =>
      prev
        ? {
            ...prev,
            rating,
            feedback,
          }
        : null
    );

    addToast('Review submitted', 'success');
  };

  const resetRecovery = () => {
    setActiveRecovery(null);
  };

  // Notifications Operations
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast('Notifications cleared.', 'info');
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
  if (context === undefined) {
    throw new Error('useFoundBack must be used within a FoundBackProvider');
  }
  return context;
};
