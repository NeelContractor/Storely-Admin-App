// src/utils/mockData.ts
import { Order, Product, Customer, Category, DashboardStats } from '../types';

export const mockStats: DashboardStats = {
  totalRevenue: 45231.89,
  totalOrders: 1429,
  totalCustomers: 892,
  totalProducts: 248,
  revenueChange: 12.5,
  ordersChange: 8.2,
  customersChange: 5.1,
  productsChange: -2.4,
};

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-001234',
    customer: { id: 'c1', name: 'Sophia Anderson', email: 'sophia@example.com' },
    items: [{ productId: 'p1', productName: 'Wireless Headphones', quantity: 1, price: 149.99 }],
    total: 149.99,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: '2',
    orderNumber: '#ORD-001235',
    customer: { id: 'c2', name: 'James Wilson', email: 'james@example.com' },
    items: [{ productId: 'p2', productName: 'Smart Watch', quantity: 2, price: 299.99 }],
    total: 599.98,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
  {
    id: '3',
    orderNumber: '#ORD-001236',
    customer: { id: 'c3', name: 'Emma Chen', email: 'emma@example.com' },
    items: [{ productId: 'p3', productName: 'Laptop Stand', quantity: 1, price: 79.99 }],
    total: 79.99,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: '2024-01-17T14:22:00Z',
    updatedAt: '2024-01-17T14:22:00Z',
  },
  {
    id: '4',
    orderNumber: '#ORD-001237',
    customer: { id: 'c4', name: 'Liam Martinez', email: 'liam@example.com' },
    items: [{ productId: 'p4', productName: 'Mechanical Keyboard', quantity: 1, price: 189.99 }],
    total: 189.99,
    status: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-18T08:30:00Z',
  },
  {
    id: '5',
    orderNumber: '#ORD-001238',
    customer: { id: 'c5', name: 'Olivia Brown', email: 'olivia@example.com' },
    items: [{ productId: 'p5', productName: 'USB Hub', quantity: 3, price: 34.99 }],
    total: 104.97,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T13:00:00Z',
  },
  {
    id: '6',
    orderNumber: '#ORD-001239',
    customer: { id: 'c6', name: 'Noah Johnson', email: 'noah@example.com' },
    items: [{ productId: 'p6', productName: 'Monitor Arm', quantity: 1, price: 119.99 }],
    total: 119.99,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-17T16:00:00Z',
  },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Wireless Headphones Pro', sku: 'WHP-001', price: 149.99, stock: 45, category: 'Electronics', status: 'active', sales: 234, createdAt: '2023-12-01T00:00:00Z' },
  { id: 'p2', name: 'Smart Watch Series X', sku: 'SWX-002', price: 299.99, stock: 8, category: 'Electronics', status: 'low_stock', sales: 189, createdAt: '2023-12-05T00:00:00Z' },
  { id: 'p3', name: 'Laptop Stand Aluminum', sku: 'LSA-003', price: 79.99, stock: 120, category: 'Accessories', status: 'active', sales: 567, createdAt: '2023-11-15T00:00:00Z' },
  { id: 'p4', name: 'Mechanical Keyboard RGB', sku: 'MKR-004', price: 189.99, stock: 3, category: 'Peripherals', status: 'low_stock', sales: 98, createdAt: '2023-12-10T00:00:00Z' },
  { id: 'p5', name: 'USB-C Hub 7-in-1', sku: 'UCH-005', price: 34.99, stock: 200, category: 'Accessories', status: 'active', sales: 890, createdAt: '2023-11-20T00:00:00Z' },
  { id: 'p6', name: 'Monitor Arm Dual', sku: 'MAD-006', price: 119.99, stock: 0, category: 'Accessories', status: 'inactive', sales: 45, createdAt: '2023-10-01T00:00:00Z' },
  { id: 'p7', name: 'Webcam 4K Ultra', sku: 'WCU-007', price: 199.99, stock: 67, category: 'Electronics', status: 'active', sales: 312, createdAt: '2023-12-20T00:00:00Z' },
  { id: 'p8', name: 'Desk Pad XL', sku: 'DPX-008', price: 49.99, stock: 5, category: 'Accessories', status: 'low_stock', sales: 445, createdAt: '2023-11-01T00:00:00Z' },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Sophia Anderson', email: 'sophia@example.com', phone: '+1 555 0101', totalOrders: 12, totalSpent: 1849.88, status: 'active', createdAt: '2023-06-15T00:00:00Z' },
  { id: 'c2', name: 'James Wilson', email: 'james@example.com', phone: '+1 555 0102', totalOrders: 8, totalSpent: 2199.92, status: 'active', createdAt: '2023-07-20T00:00:00Z' },
  { id: 'c3', name: 'Emma Chen', email: 'emma@example.com', phone: '+1 555 0103', totalOrders: 3, totalSpent: 349.97, status: 'active', createdAt: '2023-09-10T00:00:00Z' },
  { id: 'c4', name: 'Liam Martinez', email: 'liam@example.com', phone: '+1 555 0104', totalOrders: 15, totalSpent: 3289.85, status: 'active', createdAt: '2023-05-01T00:00:00Z' },
  { id: 'c5', name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1 555 0105', totalOrders: 1, totalSpent: 104.97, status: 'inactive', createdAt: '2024-01-10T00:00:00Z' },
  { id: 'c6', name: 'Noah Johnson', email: 'noah@example.com', phone: '+1 555 0106', totalOrders: 22, totalSpent: 5678.78, status: 'active', createdAt: '2023-03-15T00:00:00Z' },
];

export const mockCategories: Category[] = [
  { id: 'cat1', name: 'Electronics', description: 'Electronic gadgets and devices', productCount: 48, status: 'active' },
  { id: 'cat2', name: 'Accessories', description: 'Desk and device accessories', productCount: 92, status: 'active' },
  { id: 'cat3', name: 'Peripherals', description: 'Computer peripherals', productCount: 35, status: 'active' },
  { id: 'cat4', name: 'Audio', description: 'Audio equipment', productCount: 28, status: 'active' },
  { id: 'cat5', name: 'Wearables', description: 'Smart wearable devices', productCount: 15, status: 'inactive' },
];

export const mockRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    { label: 'Revenue', data: [30000, 35000, 28000, 42000, 38000, 51000, 47000, 55000, 49000, 62000, 58000, 71000] },
    { label: 'Expenses', data: [18000, 21000, 17000, 25000, 22000, 29000, 28000, 31000, 27000, 35000, 33000, 38000] },
  ],
};

export const mockSalesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { label: 'This Week', data: [4200, 5800, 3900, 6100, 7200, 8900, 5400] },
    { label: 'Last Week', data: [3800, 4900, 3500, 5600, 6800, 7200, 4900] },
  ],
};