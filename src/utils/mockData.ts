// src/utils/mockData.ts
//
// ─── MOCK DATA ────────────────────────────────────────────────────────────────
//
// Product uses the real type from src/types/types.ts.
// Order / Customer / Category are local mock-only shapes — they will be
// replaced with real API types once those services are built.
// ─────────────────────────────────────────────────────────────────────────────

import type { Product } from '../types/types';

// ─── Mock-only shapes (no real API type yet) ──────────────────────────────────

export interface MockOrderItem {
  productId:   string;
  productName: string;
  quantity:    number;
  price:       number;
}

export interface MockOrder {
  id:            string;
  orderNumber:   string;
  customer: {
    id:     string;
    name:   string;
    email:  string;
    avatar?: string;
  };
  items:         MockOrderItem[];
  total:         number;
  status:        'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  createdAt:     string;
  updatedAt:     string;
}

export interface MockCustomer {
  id:          string;
  name:        string;
  email:       string;
  phone?:      string;
  avatar?:     string;
  totalOrders: number;
  totalSpent:  number;
  status:      'active' | 'inactive';
  createdAt:   string;
}

export interface MockCategory {
  id:           string;
  name:         string;
  description?: string;
  productCount: number;
  image?:       string;
  status:       'active' | 'inactive';
}

export interface DashboardStats {
  totalRevenue:      number;
  totalOrders:       number;
  totalCustomers:    number;
  totalProducts:     number;
  revenueChange:     number;
  ordersChange:      number;
  customersChange:   number;
  productsChange:    number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const mockStats: DashboardStats = {
  totalRevenue:    45231.89,
  totalOrders:     1429,
  totalCustomers:  892,
  totalProducts:   248,
  revenueChange:   12.5,
  ordersChange:    8.2,
  customersChange: 5.1,
  productsChange:  -2.4,
};

// ─── Products (real Product type) ─────────────────────────────────────────────

export const mockProducts: Product[] = [
  {
    id:             'p1',
    name:           'Wireless Headphones Pro',
    description:    'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    price:          149.99,
    compareAtPrice: 199.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    images:         [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    ],
    categoryIds:    [1],
    inStock:        true,
    stockCount:     45,
    isFeatured:     true,
    tags:           ['wireless', 'audio', 'noise-cancellation'],
    slug:           'wireless-headphones-pro',
    createdAt:      '2023-12-01T00:00:00Z',
  },
  {
    id:             'p2',
    name:           'Smart Watch Series X',
    description:    'Advanced smartwatch with health tracking, GPS, and a 7-day battery.',
    price:          299.99,
    compareAtPrice: 349.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    images:         [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    ],
    categoryIds:    [1, 3],
    inStock:        true,
    stockCount:     8,
    isFeatured:     true,
    tags:           ['wearable', 'smartwatch', 'fitness'],
    slug:           'smart-watch-series-x',
    createdAt:      '2023-12-05T00:00:00Z',
  },
  {
    id:             'p3',
    name:           'Laptop Stand Aluminum',
    description:    'Ergonomic aluminium laptop stand, adjustable height, compatible with all laptops up to 17".',
    price:          79.99,
    compareAtPrice: 79.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    images:         [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    ],
    categoryIds:    [2],
    inStock:        true,
    stockCount:     120,
    isFeatured:     false,
    tags:           ['desk', 'ergonomic', 'laptop'],
    slug:           'laptop-stand-aluminum',
    createdAt:      '2023-11-15T00:00:00Z',
  },
  {
    id:             'p4',
    name:           'Mechanical Keyboard RGB',
    description:    'Tenkeyless mechanical keyboard with per-key RGB, Cherry MX switches, and aluminium frame.',
    price:          189.99,
    compareAtPrice: 229.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    images:         [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    ],
    categoryIds:    [4],
    inStock:        true,
    stockCount:     3,
    isFeatured:     false,
    tags:           ['keyboard', 'mechanical', 'rgb', 'gaming'],
    slug:           'mechanical-keyboard-rgb',
    createdAt:      '2023-12-10T00:00:00Z',
  },
  {
    id:             'p5',
    name:           'USB-C Hub 7-in-1',
    description:    '7-in-1 USB-C hub with 4K HDMI, 100W PD, 3× USB-A, SD and microSD card slots.',
    price:          34.99,
    compareAtPrice: 44.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1625315714116-6b6e3d45b28d?w=400',
    images:         [
      'https://images.unsplash.com/photo-1625315714116-6b6e3d45b28d?w=400',
    ],
    categoryIds:    [2],
    inStock:        true,
    stockCount:     200,
    isFeatured:     false,
    tags:           ['usb-c', 'hub', 'accessories'],
    slug:           'usb-c-hub-7-in-1',
    createdAt:      '2023-11-20T00:00:00Z',
  },
  {
    id:             'p6',
    name:           'Monitor Arm Dual',
    description:    'Heavy-duty dual monitor arm with full articulation, cable management, and VESA 75/100 support.',
    price:          119.99,
    compareAtPrice: 119.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400',
    images:         [
      'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400',
    ],
    categoryIds:    [2],
    inStock:        false,
    stockCount:     0,
    isFeatured:     false,
    tags:           ['monitor', 'desk', 'ergonomic'],
    slug:           'monitor-arm-dual',
    createdAt:      '2023-10-01T00:00:00Z',
  },
  {
    id:             'p7',
    name:           'Webcam 4K Ultra',
    description:    '4K 30fps webcam with autofocus, built-in ring light, and privacy shutter.',
    price:          199.99,
    compareAtPrice: 249.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
    images:         [
      'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
    ],
    categoryIds:    [1, 4],
    inStock:        true,
    stockCount:     67,
    isFeatured:     true,
    tags:           ['webcam', '4k', 'streaming'],
    slug:           'webcam-4k-ultra',
    createdAt:      '2023-12-20T00:00:00Z',
  },
  {
    id:             'p8',
    name:           'Desk Pad XL',
    description:    'Extra-large water-resistant desk pad, 90×40 cm, with non-slip base and stitched edges.',
    price:          49.99,
    compareAtPrice: 59.99,
    currency:       'USD',
    imageUrl:       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    images:         [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    ],
    categoryIds:    [2],
    inStock:        true,
    stockCount:     5,
    isFeatured:     false,
    tags:           ['desk', 'mousepad', 'accessories'],
    slug:           'desk-pad-xl',
    createdAt:      '2023-11-01T00:00:00Z',
  },
];

// ─── Orders (mock-only shape) ─────────────────────────────────────────────────

export const mockOrders: MockOrder[] = [
  {
    id:          '1',
    orderNumber: '#ORD-001234',
    customer:    { id: 'c1', name: 'Sophia Anderson', email: 'sophia@example.com' },
    items:       [{ productId: 'p1', productName: 'Wireless Headphones Pro', quantity: 1, price: 149.99 }],
    total:         149.99,
    status:        'delivered',
    paymentStatus: 'paid',
    createdAt:     '2024-01-15T10:30:00Z',
    updatedAt:     '2024-01-18T14:00:00Z',
  },
  {
    id:          '2',
    orderNumber: '#ORD-001235',
    customer:    { id: 'c2', name: 'James Wilson', email: 'james@example.com' },
    items:       [{ productId: 'p2', productName: 'Smart Watch Series X', quantity: 2, price: 299.99 }],
    total:         599.98,
    status:        'processing',
    paymentStatus: 'paid',
    createdAt:     '2024-01-16T09:15:00Z',
    updatedAt:     '2024-01-16T09:15:00Z',
  },
  {
    id:          '3',
    orderNumber: '#ORD-001236',
    customer:    { id: 'c3', name: 'Emma Chen', email: 'emma@example.com' },
    items:       [{ productId: 'p3', productName: 'Laptop Stand Aluminum', quantity: 1, price: 79.99 }],
    total:         79.99,
    status:        'pending',
    paymentStatus: 'unpaid',
    createdAt:     '2024-01-17T14:22:00Z',
    updatedAt:     '2024-01-17T14:22:00Z',
  },
  {
    id:          '4',
    orderNumber: '#ORD-001237',
    customer:    { id: 'c4', name: 'Liam Martinez', email: 'liam@example.com' },
    items:       [{ productId: 'p4', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 189.99 }],
    total:         189.99,
    status:        'shipped',
    paymentStatus: 'paid',
    createdAt:     '2024-01-17T16:45:00Z',
    updatedAt:     '2024-01-18T08:30:00Z',
  },
  {
    id:          '5',
    orderNumber: '#ORD-001238',
    customer:    { id: 'c5', name: 'Olivia Brown', email: 'olivia@example.com' },
    items:       [{ productId: 'p5', productName: 'USB-C Hub 7-in-1', quantity: 3, price: 34.99 }],
    total:         104.97,
    status:        'cancelled',
    paymentStatus: 'refunded',
    createdAt:     '2024-01-18T11:00:00Z',
    updatedAt:     '2024-01-18T13:00:00Z',
  },
  {
    id:          '6',
    orderNumber: '#ORD-001239',
    customer:    { id: 'c6', name: 'Noah Johnson', email: 'noah@example.com' },
    items:       [{ productId: 'p6', productName: 'Monitor Arm Dual', quantity: 1, price: 119.99 }],
    total:         119.99,
    status:        'delivered',
    paymentStatus: 'paid',
    createdAt:     '2024-01-14T08:00:00Z',
    updatedAt:     '2024-01-17T16:00:00Z',
  },
];

// ─── Customers (mock-only shape) ──────────────────────────────────────────────

export const mockCustomers: MockCustomer[] = [
  { id: 'c1', name: 'Sophia Anderson', email: 'sophia@example.com', phone: '+1 555 0101', totalOrders: 12, totalSpent: 1849.88, status: 'active',   createdAt: '2023-06-15T00:00:00Z' },
  { id: 'c2', name: 'James Wilson',    email: 'james@example.com',  phone: '+1 555 0102', totalOrders: 8,  totalSpent: 2199.92, status: 'active',   createdAt: '2023-07-20T00:00:00Z' },
  { id: 'c3', name: 'Emma Chen',       email: 'emma@example.com',   phone: '+1 555 0103', totalOrders: 3,  totalSpent: 349.97,  status: 'active',   createdAt: '2023-09-10T00:00:00Z' },
  { id: 'c4', name: 'Liam Martinez',   email: 'liam@example.com',   phone: '+1 555 0104', totalOrders: 15, totalSpent: 3289.85, status: 'active',   createdAt: '2023-05-01T00:00:00Z' },
  { id: 'c5', name: 'Olivia Brown',    email: 'olivia@example.com', phone: '+1 555 0105', totalOrders: 1,  totalSpent: 104.97,  status: 'inactive', createdAt: '2024-01-10T00:00:00Z' },
  { id: 'c6', name: 'Noah Johnson',    email: 'noah@example.com',   phone: '+1 555 0106', totalOrders: 22, totalSpent: 5678.78, status: 'active',   createdAt: '2023-03-15T00:00:00Z' },
];

// ─── Categories (mock-only shape) ─────────────────────────────────────────────

export const mockCategories: MockCategory[] = [
  { id: 'cat1', name: 'Electronics',  description: 'Electronic gadgets and devices',  productCount: 48, status: 'active'   },
  { id: 'cat2', name: 'Accessories',  description: 'Desk and device accessories',      productCount: 92, status: 'active'   },
  { id: 'cat3', name: 'Peripherals',  description: 'Computer peripherals',             productCount: 35, status: 'active'   },
  { id: 'cat4', name: 'Audio',        description: 'Audio equipment',                  productCount: 28, status: 'active'   },
  { id: 'cat5', name: 'Wearables',    description: 'Smart wearable devices',           productCount: 15, status: 'inactive' },
];

// ─── Chart data ───────────────────────────────────────────────────────────────

export const mockRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    { label: 'Revenue',  data: [30000, 35000, 28000, 42000, 38000, 51000, 47000, 55000, 49000, 62000, 58000, 71000] },
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