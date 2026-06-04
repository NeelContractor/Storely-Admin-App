// src/types/index.ts
//
// ─── REAL TYPES ───────────────────────────────────────────────────────────────
// Re-export everything from types.ts so that imports from '../../types' and
// '../../types/types' both resolve to the same type. This kills the duplicate-
// Product conflict for good.
// ─────────────────────────────────────────────────────────────────────────────
export * from './types';

// ─── MOCK-ONLY TYPES ──────────────────────────────────────────────────────────
// These are only used by mockData.ts / dev fixtures.
// They are intentionally NOT named the same as the real types above.
// ─────────────────────────────────────────────────────────────────────────────

export interface MockUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    createdAt: string;
}

// MockProduct is the old mock shape. Real Product comes from types.ts above.
export interface MockProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    status: 'active' | 'inactive' | 'low_stock';
    sales: number;
    createdAt: string;
}

export interface MockOrder {
    id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    items: MockOrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
    createdAt: string;
    updatedAt: string;
}

export interface MockOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface MockCustomer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    totalOrders: number;
    totalSpent: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

// MockCategory is the old mock shape. Real Category comes from useAppStore.ts.
export interface MockCategory {
    id: string;
    name: string;
    description?: string;
    productCount: number;
    image?: string;
    status: 'active' | 'inactive';
}

export interface StatCard {
    title: string;
    value: string | number;
    change: number;
    changeType: 'increase' | 'decrease';
    icon: string;
    color: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    productsChange: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label?: string;
        data: number[];
        color?: string;
    }[];
}