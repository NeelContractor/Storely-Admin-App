// src/store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

const defaultNotifications: Notification[] = [
  { id: 'n1', title: 'New Order', message: '#ORD-001240 has been placed', type: 'info', read: false, createdAt: new Date().toISOString() },
  { id: 'n2', title: 'Low Stock Alert', message: 'Mechanical Keyboard RGB has only 3 units left', type: 'warning', read: false, createdAt: new Date().toISOString() },
  { id: 'n3', title: 'Payment Received', message: 'Order #ORD-001234 payment confirmed', type: 'success', read: true, createdAt: new Date().toISOString() },
];

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  notifications: defaultNotifications,
  unreadCount: defaultNotifications.filter((n) => !n.read).length,
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));