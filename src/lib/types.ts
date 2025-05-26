// Add serviceName to Order type:
export interface Order {
  id: string;
  userId: string;
  customerId?: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
    name?: string; // Add name property to fix error in AdminOrders
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | string; // Add string to allow for more status types
  createdAt: string;
  serviceId?: string;
  serviceName?: string;
  quantity?: number;
  totalPrice?: number;
  completedAt?: string;
  durationMonths?: number;
  accountId?: string;
  customerName?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    pinCode?: string;
    [key: string]: any;
  };
  credentialStatus?: 'available' | 'pending' | 'assigned';
  paymentMethod?: string;
  notes?: string;
  orderId?: string; // Add this to fix error in AdminPayments
}

// Add Credential and CredentialStock types
export interface Credential {
  email: string;
  password: string;
  username?: string;
  pinCode?: string;
  [key: string]: any;
}

export interface CredentialStock {
  id: string;
  serviceId: string;
  credentials: Credential;
  status: 'available' | 'assigned';
  createdAt: string;
  orderId?: string;
  userId?: string;
}

// Add StockRequest type for pending requests
export interface StockRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName?: string;
  productName?: string; // Add this new property
  orderId: string;
  status: 'pending' | 'fulfilled' | 'cancelled' | string; // Add string to allow for more status types
  createdAt: string;
  fulfilledAt?: string;
  customerName?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  orderDetails?: {
    quantity?: number;
    totalPrice?: number;
    durationMonths?: number;
    notes?: string;
    accountId?: string;
    customerEmail?: string;
  };
}

// Add the missing User and UserRole types
export type UserRole = 'admin' | 'customer' | 'wholesale';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  balance: number;
  createdAt: string;
}

// Add Product and Service types
export type ServiceType = 'subscription' | 'topup' | 'one-time' | 'lifetime' | 'recharge' | 'giftcard' | 'service';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice: number;
  type: ServiceType;
  image?: string;
  categoryId?: string;
  category?: string; // For backward compatibility
  featured?: boolean;
  deliveryTime?: string;
  apiUrl?: string;
  availableMonths?: number[];
  value?: number;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
  features?: string[];
  availableForCustomers?: boolean;
  status?: string; // Add status for compatibility with mockData
  createdAt?: string; // Add createdAt for compatibility with mockData
  useExternalApi?: boolean; // Add this property to indicate if this service should use the external API
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
  categoryId?: string;
  featured?: boolean;
  type?: ServiceType;
  deliveryTime?: string;
  apiUrl?: string;
  availableMonths?: number[];
  value?: number;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
  features?: string[];
  availableForCustomers?: boolean;
}

// Add ServiceCategory type
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  order?: number;
  icon?: string;
  image?: string; // Added image property
}

// Add MonthlyPricing type
export interface MonthlyPricing {
  months: number;
  price: number;
  wholesalePrice?: number;
  savings?: number;
}

// Update Subscription type to include 'pending' status and isPending property
export interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  durationMonths?: number;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  credentialStatus?: 'available' | 'pending' | 'assigned';
  credentialStockId?: string; // Added for Supabase credential_stock reference
  isPending?: boolean; // Added to track if credentials are pending
}

// Update SupportTicket type to include priority and proper status
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  serviceId?: string;
  imageUrl?: string;
}

// Update TicketResponse type to fix missing properties
export interface TicketResponse {
  id: string;
  ticketId: string;
  userId?: string;
  message: string;
  createdAt: string;
  isStaff?: boolean;
  sentBy?: string;
}

// Update SimpleCustomer type to include additional properties
export interface SimpleCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpent?: number;
  activeSubscriptions?: number;
  lastPurchase?: string;
}

// Add Customer type (missing in original code)
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  wholesalerId?: string;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  notes?: string;
  balance?: number;
}

// Update AdminNotification type to support more notification types
export type IssueType = 'profile_fix' | 'payment_issue' | 'password_reset' | 'new_order' | 'payment_request' | 'ticket' | 'stock' | 'payment' | 'subscription' | 'order' | 'system' | 'login_problem' | 'account_locked' | 'service_unavailable' | 'other';

export interface AdminNotification {
  id: string;
  type: 'profile_fix' | 'payment_issue' | 'password_reset' | 'new_order' | 'payment_request' | 'ticket' | 'stock' | 'payment' | 'subscription' | 'order' | 'system' | 'login_problem' | 'account_locked' | 'service_unavailable' | 'other';
  customerName?: string;
  serviceName?: string;
  amount?: number;
  paymentMethod?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
  customerId?: string;
  serviceId?: string;
  subscriptionId?: string;
  userId?: string;
  title?: string;
  message?: string;
  linkTo?: string;
}

// Add CustomerNotification type
export interface CustomerNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  serviceId?: string;
  subscriptionId?: string;
  userId?: string;
  paymentId?: string;
  amount?: number;
  serviceName?: string;
}

// Update Payment and PaymentStatus types
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed' | 'failed';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  method: string;
  description?: string;
  notes?: string;
  userName?: string;
  userEmail?: string;
  transactionId?: string;
  receiptUrl?: string;
  reviewedAt?: string;
  orderId?: string;
}

// Update SubscriptionIssue types
export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface SubscriptionIssue {
  id: string;
  userId: string;
  subscriptionId: string;
  type: IssueType;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  serviceId?: string;
  description?: string;
  subject?: string;
  customerName?: string;
  serviceName?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    [key: string]: any;
  };
  notes?: string;
}

// Add WholesaleOrder type
export interface WholesaleOrder {
  id: string;
  userId?: string;
  wholesalerId?: string;
  customerId?: string;
  serviceId?: string;
  serviceName?: string;  // Add this field
  quantity?: number;
  totalPrice?: number;
  status: string;
  createdAt: string;
  durationMonths?: number;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCompany?: string;
  notes?: string;
  services?: string[];
}

// Add DigitalItem type for AdminDigitalInventory component
export interface DigitalItem extends CredentialStock {
  serviceName: string;
}

// Update ServiceCategory to include optional image property
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  order?: number;
  icon?: string;
  image?: string; // Added image property
}

// Define CredentialInput interface for StockIssueManager
export interface CredentialInput {
  username?: string;
  password?: string;
  email?: string;
  notes?: string;
  [key: string]: string | undefined;
}
