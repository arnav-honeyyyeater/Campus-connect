'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { IMockStore, UserAccount, Profile, Session, StoreEvent } from './types';
import { mockStore } from './store';

interface MockStoreContextValue {
  store: IMockStore;
  currentUser: UserAccount | null;
  currentProfile: Profile | null;
  session: Session | null;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  isLoading: boolean;
  refreshUnreadCounts: () => Promise<void>;
}

const MockStoreContext = createContext<MockStoreContextValue | null>(null);

export interface MockStoreProviderProps {
  children: React.ReactNode;
}

export function MockStoreProvider({ children }: MockStoreProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state on client mount
  useEffect(() => {
    const currentSession = mockStore.getSession();
    setSession(currentSession);
    setIsLoading(false);

    // Initial count fetch
    updateCounts();

    // Subscribe to store reactive events
    const unsubscribe = mockStore.subscribe((event: StoreEvent) => {
      if (event.type === 'AUTH_STATE_CHANGE') {
        const nextSession = mockStore.getSession();
        setSession(nextSession ? { ...nextSession, profile: { ...nextSession.profile } } : null);
        updateCounts();
      } else if (event.type === 'NOTIFICATIONS_CHANGE') {
        updateNotificationCount();
      } else if (event.type === 'MESSAGES_CHANGE') {
        updateMessageCount();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNotificationCount = async () => {
    try {
      const notifs = await mockStore.getNotifications();
      const unread = notifs.filter((n) => !n.isRead).length;
      setUnreadNotificationsCount(unread);
    } catch {
      // Ignore in background
    }
  };

  const updateMessageCount = async () => {
    try {
      const convs = await mockStore.getConversations();
      const totalUnread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnread);
    } catch {
      // Ignore in background
    }
  };

  const updateCounts = async () => {
    await Promise.all([updateNotificationCount(), updateMessageCount()]);
  };

  const value = useMemo<MockStoreContextValue>(() => {
    return {
      store: mockStore,
      currentUser: session ? session.user : null,
      currentProfile: session ? session.profile : null,
      session,
      unreadNotificationsCount,
      unreadMessagesCount,
      isLoading,
      refreshUnreadCounts: updateCounts,
    };
  }, [session, unreadNotificationsCount, unreadMessagesCount, isLoading]);

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore(): MockStoreContextValue {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within a <MockStoreProvider>');
  }
  return context;
}

// Convenience Hooks
export function useCurrentUser(): UserAccount | null {
  const { currentUser } = useMockStore();
  return currentUser;
}

export function useCurrentProfile(): Profile | null {
  const { currentProfile } = useMockStore();
  return currentProfile;
}

export function useUnreadCounts() {
  const { unreadNotificationsCount, unreadMessagesCount, refreshUnreadCounts } = useMockStore();
  return { unreadNotificationsCount, unreadMessagesCount, refreshUnreadCounts };
}
