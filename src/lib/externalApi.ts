
import { toast } from 'sonner';
import { Service, Order, Subscription } from '@/lib/types';

const API_BASE_URL = 'https://api.example.com/v1'; // Replace with the actual API endpoint from the documentation

// Default headers for API requests
const getDefaultHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add authorization header as needed
    // 'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } catch (e) {
      throw new Error(`API Error: ${response.status}`);
    }
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Generic request function
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders: HeadersInit = {}
): Promise<T> => {
  try {
    const headers = { ...getDefaultHeaders(), ...customHeaders };
    const config: RequestInit = { method, headers };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error('API Request Failed', { description: message });
    throw error;
  }
};

// API service functions for selected top-up services only
export const externalApi = {
  // Service-related functions
  getServices: () => 
    apiRequest<Service[]>('/services'),
  
  getServiceById: (serviceId: string) => 
    apiRequest<Service>(`/services/${serviceId}`),
  
  // Order-related functions
  createOrder: (orderData: {
    serviceId: string;
    quantity: number;
    accountId?: string;
    notes?: string;
    duration?: number;
  }) => 
    apiRequest<Order>('/orders', 'POST', orderData),
  
  getOrderById: (orderId: string) => 
    apiRequest<Order>(`/orders/${orderId}`),
  
  // Top-up specific functions
  processTopUp: (data: {
    serviceId: string;
    accountId: string;
    amount: number;
    notes?: string;
  }) => 
    apiRequest<{success: boolean; orderId: string}>('/topup', 'POST', data),
  
  checkTopUpStatus: (orderId: string) => 
    apiRequest<{status: string; message?: string}>(`/topup/status/${orderId}`),
  
  // Subscription-related functions
  getSubscriptions: () => 
    apiRequest<Subscription[]>('/subscriptions'),
  
  getSubscriptionById: (subscriptionId: string) => 
    apiRequest<Subscription>(`/subscriptions/${subscriptionId}`),
  
  // Credentials-related functions
  getCredentials: (serviceId: string) => 
    apiRequest<{available: boolean; credentials?: any}>(`/stock/${serviceId}`),
};

export default externalApi;
