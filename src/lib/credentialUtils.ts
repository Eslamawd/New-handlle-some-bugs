
import { Credential, Subscription, Order } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Convert a subscription's credentials to a Credential object for stock
export const convertSubscriptionToStock = (data: {
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    pinCode?: string;
    [key: string]: any;
  } 
}): Credential => {
  if (!data.credentials) {
    return {
      email: '',
      password: '',
      username: '',
      pinCode: ''
    };
  }
  
  return {
    email: data.credentials.email || '',
    password: data.credentials.password || '',
    username: data.credentials.username || '',
    pinCode: data.credentials.pinCode || ''
  };
};

// Handle orders that may not have credentials property
export const convertOrderToStock = (order: any): Credential => {
  // Check if order has credentials directly
  if (order.credentials) {
    if (typeof order.credentials === 'string') {
      try {
        const parsed = JSON.parse(order.credentials);
        return {
          email: parsed.email || '',
          password: parsed.password || '',
          username: parsed.username || '',
          pinCode: parsed.pinCode || ''
        };
      } catch {
        return {
          email: '',
          password: '',
          username: '',
          pinCode: ''
        };
      }
    } else {
      return {
        email: order.credentials.email || '',
        password: order.credentials.password || '',
        username: order.credentials.username || '',
        pinCode: order.credentials.pinCode || ''
      };
    }
  }
  
  // For orders without credentials, create an empty one
  return {
    email: '',
    password: '',
    username: '',
    pinCode: ''
  };
};

// Function to assign credentials to customer and send notification
export const assignCredentialsToCustomer = async (
  userId: string, 
  serviceId: string, 
  orderId: string
): Promise<{success: boolean, credentials?: Credential}> => {
  try {
    // Find an available credential in stock
    const { data: availableCredentials, error: stockError } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', 'available')
      .limit(1)
      .single();
    
    if (stockError || !availableCredentials) {
      console.error('No available credentials found:', stockError);
      return { success: false };
    }
    
    // Update the credential status to assigned
    const { error: updateError } = await supabase
      .from('credential_stock')
      .update({
        status: 'assigned',
        user_id: userId,
        order_id: orderId
      })
      .eq('id', availableCredentials.id);
      
    if (updateError) {
      console.error('Error updating credential status:', updateError);
      return { success: false };
    }
    
    // Update the order with the credential information
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        credentials: availableCredentials.credentials,
        credential_status: 'assigned',
        status: 'completed'
      })
      .eq('id', orderId);
      
    if (orderError) {
      console.error('Error updating order with credentials:', orderError);
      return { success: false };
    }
    
    // Send a notification to the customer
    await sendCredentialNotification(userId, serviceId, availableCredentials.credentials as Credential);
    
    return {
      success: true,
      credentials: availableCredentials.credentials as Credential
    };
  } catch (error) {
    console.error('Error in assignCredentialsToCustomer:', error);
    return { success: false };
  }
};

// Send a notification to the customer about their new credentials
const sendCredentialNotification = async (
  userId: string,
  serviceId: string,
  credentials: Credential
) => {
  try {
    // Get service details from local storage as a fallback since the table might not exist
    let serviceName = '';
    try {
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const services = JSON.parse(storedServices);
        const service = services.find((s: any) => s.id === serviceId);
        if (service) {
          serviceName = service.name;
        }
      }
    } catch (storageError) {
      console.error('Error getting service from localStorage:', storageError);
    }
    
    if (!serviceName) {
      serviceName = 'your service';
    }
    
    // Create a notification for the user - check if the table exists first
    try {
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          user_id: userId,
          type: 'credential',
          message: `Your credentials for ${serviceName} are now available in your dashboard.`,
          service_id: serviceId,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    } catch (notificationError) {
      console.error('Error in creating notification:', notificationError);
    }
  } catch (error) {
    console.error('Error in sendCredentialNotification:', error);
  }
};

// Function to get user's credentials by order ID
export const getCredentialsByOrderId = async (orderId: string): Promise<Credential | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching credentials:', error);
      return null;
    }
    
    // Create a typed version of data to work with
    const typedData: any = data;
    
    // Handle case where credentials property might not exist
    if (!typedData.credentials) {
      console.log('No credentials found for order:', orderId);
      return null;
    }
    
    let credentials: Credential;
    
    // Parse credentials if they're a string, or use directly if object
    if (typeof typedData.credentials === 'string') {
      try {
        credentials = JSON.parse(typedData.credentials) as Credential;
      } catch (e) {
        console.error('Error parsing credentials string:', e);
        return {
          email: '',
          password: '',
          username: '',
          pinCode: ''
        };
      }
    } else {
      // Type assertion needed here
      const credentialsData = typedData.credentials as any;
      credentials = {
        email: credentialsData.email || '',
        password: credentialsData.password || '',
        username: credentialsData.username || '',
        pinCode: credentialsData.pinCode || '',
        notes: credentialsData.notes || ''
      };
    }
    
    return credentials;
  } catch (error) {
    console.error('Error in getCredentialsByOrderId:', error);
    return null;
  }
};
