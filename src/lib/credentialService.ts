import { supabase } from '@/integrations/supabase/client';
import { Credential, StockRequest } from '@/lib/types';
import { toast } from '@/lib/toast';
import { v4 as uuidv4 } from 'uuid';

// Check if stock is available for a given service
export const checkStockAvailability = async (serviceId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .select('id')
      .eq('service_id', serviceId)
      .eq('status', 'available')
      .limit(1);
    
    if (error) {
      console.error('Error checking stock availability:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkStockAvailability:', error);
    return false;
  }
};

// Add credentials to stock
export const addCredentialToStock = async (
  serviceId: string, 
  credentials: Credential,
  status: 'available' | 'assigned' = 'available'
): Promise<boolean> => {
  try {
    console.log('Adding credential to stock:', { serviceId, credentials, status });
    
    // Generate a proper UUID for the stock item
    const stockId = uuidv4();
    
    // Insert the credential into Supabase
    const { error } = await supabase
      .from('credential_stock')
      .insert({
        id: stockId,
        service_id: serviceId,
        credentials: credentials,
        status: status,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error adding credential to stock:', error);
      toast.error('Failed to add credential to stock');
      return false;
    }
    
    toast.success('Credential added to stock successfully');
    
    // Dispatch an event to update the UI
    window.dispatchEvent(new CustomEvent('credential-added'));
    
    return true;
  } catch (error) {
    console.error('Error in addCredentialToStock:', error);
    toast.error('Failed to add credential to stock');
    return false;
  }
};

// Create a stock request when no credentials are available
export const createStockRequest = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  orderId: string,
  customerName?: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Fetch user name for display in the stock issue
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    // Type-safe check (userError has no 'name' property)
    const userProfile = userError ? null : userData;
    const customerDisplayName = customerName || (userProfile && userProfile.name ? userProfile.name : 'Unknown Customer');
    
    // Create a stock request with proper names
    const { error: requestError } = await supabase
      .from('stock_issue_logs')
      .insert({
        user_id: userId,
        service_id: serviceId,
        service_name: serviceName,
        customer_name: customerDisplayName,
        order_id: orderId,
        status: 'pending',
        priority: 'medium',
        notes: notes || 'Automatic request due to empty stock',
        created_at: new Date().toISOString()
      });
    
    if (requestError) {
      console.error('Error creating stock request:', requestError);
      return false;
    }
    
    // Create admin notification
    try {
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'stock',
          title: 'Stock Replenishment Needed',
          message: `A customer has requested ${serviceName} but stock is empty.`,
          customer_id: userId,
          customer_name: customerDisplayName,
          service_id: serviceId,
          service_name: serviceName,
          is_read: false,
          created_at: new Date().toISOString()
        });
      
      if (notificationError) {
        console.error('Error creating admin notification:', notificationError);
      }
    } catch (notificationError) {
      console.error('Error in creating notification:', notificationError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in createStockRequest:', error);
    return false;
  }
};

// Get all available credentials
export const getAvailableCredentials = async (serviceId: string) => {
  try {
    console.log('Fetching available credentials for service:', serviceId);
    
    const { data, error } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', 'available');
      
    if (error) {
      console.error('Error fetching available credentials:', error);
      
      // Fallback to localStorage for demo/testing
      const stockItems = JSON.parse(localStorage.getItem('credential_stock') || '[]');
      return stockItems.filter(item => 
        item.serviceId === serviceId && item.status === 'available'
      );
    }
    
    console.log('Available credentials from Supabase:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getAvailableCredentials:', error);
    
    // Fallback to localStorage for demo/testing
    const stockItems = JSON.parse(localStorage.getItem('credential_stock') || '[]');
    return stockItems.filter(item => 
      item.serviceId === serviceId && item.status === 'available'
    );
  }
};

// Get pending stock requests
export const getPendingStockRequests = async (): Promise<StockRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending stock requests:', error);
      return [];
    }
    
    // Type-safe map with correct type assertions
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      serviceId: item.service_id,
      serviceName: item.service_name || 'Unknown Service',
      orderId: item.order_id,
      status: item.status as "pending" | "fulfilled" | "cancelled",
      createdAt: item.created_at,
      fulfilledAt: item.fulfilled_at,
      customerName: item.customer_name || 'Unknown',
      priority: (item.priority as 'high' | 'medium' | 'low') || 'medium',
      notes: item.notes || ''
    }));
  } catch (error) {
    console.error('Error in getPendingStockRequests:', error);
    return [];
  }
};

// Get all stock issues
export const getStockIssues = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select('*, profiles:user_id(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching stock issues:', error);
      return [];
    }
    
    // Type-safe map with correct type assertions
    return (data || []).map(item => {
      const profile = item.profiles ? item.profiles as Record<string, any> : null;
      return {
        id: item.id,
        userId: item.user_id,
        serviceId: item.service_id,
        orderId: item.order_id,
        status: item.status as "pending" | "fulfilled" | "cancelled",
        createdAt: item.created_at,
        resolvedAt: item.resolved_at,
        customerName: profile ? profile.name || 'Unknown' : 'Unknown',
        notes: item.notes || ''
      };
    });
  } catch (error) {
    console.error('Error in getStockIssues:', error);
    return [];
  }
};

// Resolve a stock issue
export const resolveStockIssue = async (issueId: string, status: 'fulfilled' | 'cancelled') => {
  try {
    const { error } = await supabase
      .from('stock_issue_logs')
      .update({
        status: status,
        resolved_at: new Date().toISOString()
      })
      .eq('id', issueId);
      
    if (error) {
      console.error('Error resolving stock issue:', error);
      return false;
    }
    
    // Dispatch an event to refresh the UI
    window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    
    return true;
  } catch (error) {
    console.error('Error in resolveStockIssue:', error);
    return false;
  }
};

// Fulfill a stock request
export const fulfillStockRequest = async (
  requestId: string,
  orderId: string,
  userId: string,
  serviceId: string,
  credentials: Credential
): Promise<boolean> => {
  try {
    console.log('Fulfilling stock request:', { requestId, orderId, userId, serviceId, credentials });
    
    // Add credential to stock and assign it to the user
    const { error: stockError } = await supabase
      .from('credential_stock')
      .insert({
        service_id: serviceId,
        credentials: credentials,
        status: 'assigned',
        user_id: userId,
        order_id: orderId,
        created_at: new Date().toISOString()
      });
    
    if (stockError) {
      console.error('Error adding credential to stock:', stockError);
      return false;
    }
    
    // Update the order with the credential information
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        credentials: credentials,
        credential_status: 'assigned',
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (orderError) {
      console.error('Error updating order with credentials:', orderError);
      return false;
    }
    
    // Mark the stock request as fulfilled
    const { error: requestError } = await supabase
      .from('stock_issue_logs')
      .update({
        status: 'fulfilled',
        resolved_at: new Date().toISOString()
      })
      .eq('id', requestId);
      
    if (requestError) {
      console.error('Error updating stock request status:', requestError);
      return false;
    }
    
    // Dispatch events to update UI
    window.dispatchEvent(new CustomEvent('credential-added'));
    window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    
    return true;
  } catch (error) {
    console.error('Error in fulfillStockRequest:', error);
    return false;
  }
};
