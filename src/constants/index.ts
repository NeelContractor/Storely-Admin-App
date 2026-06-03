// src/constants/index.ts

export const ROUTES = {
    // Auth
    SIGN_IN: 'SignIn',
    REGISTER: 'Register',
  
    // Main
    DASHBOARD: 'Dashboard',
    
    // Orders
    ORDERS: 'Orders',
    ALL_ORDERS: 'AllOrders',
    PENDING_ORDERS: 'PendingOrders',
    PROCESSING_ORDERS: 'ProcessingOrders',
    SHIPPED_ORDERS: 'ShippedOrders',
    DELIVERED_ORDERS: 'DeliveredOrders',
    CANCELLED_ORDERS: 'CancelledOrders',
  
    // Products
    PRODUCTS: 'Products',
    ALL_PRODUCTS: 'AllProducts',
    ADD_PRODUCT: 'AddProduct',
    LOW_STOCK: 'LowStock',
  
    // Customers
    CUSTOMERS: 'Customers',
    ALL_CUSTOMERS: 'AllCustomers',
    CUSTOMER_REVIEWS: 'CustomerReviews',
  
    // Analytics
    ANALYTICS: 'Analytics',
  
    // Marketing
    MARKETING: 'Marketing',
    CAMPAIGNS: 'Campaigns',
    COUPONS: 'Coupons',
  
    // Store
    STORE: 'Store',
    STORE_PROFILE: 'StoreProfile',
    PAYMENTS: 'Payments',
    SHIPPING: 'Shipping',
  
    // Settings
    SETTINGS: 'Settings',
    ACCOUNT_SETTINGS: 'AccountSettings',
    SECURITY: 'Security',
    NOTIFICATIONS: 'Notifications',
    ROLES: 'RolesPermissions',
} as const;
  
export const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
    returned: '#6B7280',
};
  
export const ORDER_STATUS_BG: Record<string, string> = {
    pending: '#FEF3C7',
    processing: '#DBEAFE',
    shipped: '#EDE9FE',
    delivered: '#D1FAE5',
    cancelled: '#FEE2E2',
    returned: '#F3F4F6',
};
  
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
    paid: '#10B981',
    unpaid: '#EF4444',
    refunded: '#F59E0B',
};