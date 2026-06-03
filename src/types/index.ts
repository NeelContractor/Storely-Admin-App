// src/types/index.ts

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    createdAt: string;
}
  
export interface Product {
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

export interface Order {
    id: string;
    orderNumber: string;
    customer: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
    createdAt: string;
    updatedAt: string;
}
  
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}
  
export interface Customer {
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
  
export interface Category {
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