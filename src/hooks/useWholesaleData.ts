import { useState, useEffect, useMemo } from 'react';
import { WholesaleOrder, Subscription, Service, Credential } from '@/lib/types';
import { Customer } from '@/lib/data';
import { loadServices } from '@/lib/productManager';
import { convertSubscriptionToStock } from '@/lib/credentialUtils';
import { addCredentialToStock } from '@/lib/credentialService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export function useWholesaleData(currentWholesaler: string) {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setServices(loadServices());
    
    const handleServiceUpdated = () => {
      setServices(loadServices());
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, []);

  useEffect(() => {
    if (!currentWholesaler) return;
    
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          console.log('No authenticated session, loading from localStorage');
          loadFromLocalStorage();
          setIsLoading(false);
          return;
        }

        const { data: customers, error: customersError } = await supabase
          .from('wholesale_customers')
          .select('*')
          .eq('wholesaler_id', session.session.user.id);
          
        if (customersError) {
          console.error('Error fetching customers:', customersError);
          toast.error('Error loading customer data');
        } else if (customers) {
          console.log('Fetched customers from Supabase:', customers);
          const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            wholesalerId: customer.wholesaler_id,
            address: customer.address || '',
            notes: customer.notes || '',
            balance: customer.balance || 0,
            createdAt: customer.created_at
          }));
          setCustomersData(formattedCustomers);
          
          localStorage.setItem('wholesaleCustomers', JSON.stringify(formattedCustomers));
          
          if (formattedCustomers.length > 0) {
            const customerIds = formattedCustomers.map(c => c.id);
            
            const { data: allSubs, error: allSubsError } = await supabase
              .from('wholesale_subscriptions')
              .select('*')
              .in('customer_id', customerIds);
              
            if (allSubsError) {
              console.error('Error fetching all subscriptions:', allSubsError);
            } else if (allSubs) {
              const formattedAllSubs = allSubs.map(sub => {
                let credentialsObj = undefined;
                
                if (sub.credentials) {
                  const creds = sub.credentials as any;
                  credentialsObj = {
                    username: typeof creds === 'object' ? creds.username || '' : '',
                    password: typeof creds === 'object' ? creds.password || '' : '',
                    email: typeof creds === 'object' ? creds.email || '' : '',
                    notes: typeof creds === 'object' ? creds.notes || '' : ''
                  };
                }
                
                return {
                  id: sub.id,
                  userId: sub.customer_id,
                  serviceId: sub.service_id,
                  startDate: sub.start_date,
                  endDate: sub.end_date,
                  status: sub.status as 'active' | 'expired' | 'cancelled' | 'pending',
                  durationMonths: sub.duration_months,
                  credentials: credentialsObj,
                  isPending: sub.status === 'pending' || !sub.credentials
                };
              });
              
              setSubscriptions(formattedAllSubs);
              localStorage.setItem('wholesaleSubscriptions', JSON.stringify(formattedAllSubs));
            }
          }
        }

        if (subscriptions.length === 0) {
          const { data: subs, error: subsError } = await supabase
            .from('wholesale_subscriptions')
            .select('*')
            .eq('wholesaler_id', session.session.user.id);
            
          if (subsError) {
            console.error('Error fetching subscriptions:', subsError);
            toast.error('Error loading subscription data');
          } else if (subs && subs.length > 0) {
            const formattedSubs = subs.map(sub => {
              let credentialsObj = undefined;
              
              if (sub.credentials) {
                const creds = sub.credentials as any;
                credentialsObj = {
                  username: typeof creds === 'object' ? creds.username || '' : '',
                  password: typeof creds === 'object' ? creds.password || '' : '',
                  email: typeof creds === 'object' ? creds.email || '' : '',
                  notes: typeof creds === 'object' ? creds.notes || '' : ''
                };
              }
              
              return {
                id: sub.id,
                userId: sub.customer_id,
                serviceId: sub.service_id,
                startDate: sub.start_date,
                endDate: sub.end_date,
                status: sub.status as 'active' | 'expired' | 'cancelled' | 'pending',
                durationMonths: sub.duration_months,
                credentials: credentialsObj,
                isPending: sub.status === 'pending' || !sub.credentials
              };
            });
            
            setSubscriptions(formattedSubs);
            localStorage.setItem('wholesaleSubscriptions', JSON.stringify(formattedSubs));
          }
        }

        const { data: orderData, error: ordersError } = await supabase
          .from('wholesale_orders')
          .select('*')
          .eq('wholesaler_id', session.session.user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          toast.error('Error loading order data');
        } else if (orderData) {
          const formatOrders = (ordersData: any[]): WholesaleOrder[] => {
            return ordersData.map(order => {
              let credentials = undefined;
              if (order.credentials) {
                credentials = typeof order.credentials === 'string'
                  ? JSON.parse(order.credentials)
                  : order.credentials;
              }
              
              return {
                id: order.id,
                wholesalerId: order.wholesaler_id,
                customerId: order.customer_id,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                customerAddress: order.customer_address,
                customerCompany: order.customer_company,
                serviceId: order.service_id,
                serviceName: order.service_name,
                quantity: order.quantity,
                totalPrice: order.total_price,
                durationMonths: order.duration_months,
                status: order.status,
                createdAt: order.created_at,
                notes: order.notes,
                credentials: credentials
              };
            });
          };
          
          const formattedOrders = formatOrders(orderData);
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Error connecting to database');
        
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentWholesaler]);

  const loadFromLocalStorage = () => {
    const savedOrders = localStorage.getItem('wholesaleOrders');
    const savedSubscriptions = localStorage.getItem('wholesaleSubscriptions');
    const savedCustomers = localStorage.getItem('wholesaleCustomers');
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
    
    if (savedCustomers) {
      setCustomersData(JSON.parse(savedCustomers));
    }
  };
  
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('wholesaleOrders', JSON.stringify(orders));
    }
    
    if (subscriptions.length > 0) {
      localStorage.setItem('wholesaleSubscriptions', JSON.stringify(subscriptions));
    }
    
    if (customersData.length > 0) {
      localStorage.setItem('wholesaleCustomers', JSON.stringify(customersData));
    }
  }, [orders, subscriptions, customersData]);

  const wholesalerCustomers = useMemo(() => {
    if (!currentWholesaler) return [];
    return customersData.filter(customer => customer.wholesalerId === currentWholesaler);
  }, [currentWholesaler, customersData]);
  
  const filteredSubscriptions = useMemo(() => {
    return subscriptions;
  }, [subscriptions]);

  const handleOrderPlaced = async (order: WholesaleOrder) => {
    try {
      let orderCredentials: any = null;
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const { data: availableCredential, error: credentialError } = await supabase
          .from('credential_stock')
          .select('*')
          .eq('service_id', order.serviceId)
          .eq('status', 'available')
          .limit(1)
          .single();
          
        if (credentialError) {
          console.error('Error fetching credential from stock:', credentialError);
        } else if (availableCredential) {
          console.log('Found available credential in stock:', availableCredential.id);
          orderCredentials = availableCredential.credentials;
          
          const { error: updateError } = await supabase
            .from('credential_stock')
            .update({ 
              status: 'assigned', 
              user_id: order.customerId,
              order_id: order.id
            })
            .eq('id', availableCredential.id);
            
          if (updateError) {
            console.error('Error updating credential status:', updateError);
          }
        } else {
          console.log('No credentials available in stock for service:', order.serviceId);
          
          const stockIssueId = `stock-issue-${Date.now()}`;
          const { error: stockIssueError } = await supabase
            .from('stock_issue_logs')
            .insert({
              id: stockIssueId,
              user_id: session.session.user.id,
              service_id: order.serviceId,
              service_name: services.find(s => s.id === order.serviceId)?.name || 'Unknown Service',
              order_id: order.id,
              status: 'pending',
              customer_name: order.customerName,
              priority: 'high',
              notes: `Wholesale order requires credentials for ${order.customerName}`
            });
            
          if (stockIssueError) {
            console.error('Error creating stock issue record:', stockIssueError);
          }
          
          const notificationId = `notification-${Date.now()}`;
          const { error: notificationError } = await supabase
            .from('admin_notifications')
            .insert({
              id: notificationId,
              type: 'stock',
              title: 'Stock Issue',
              message: `Pending order requires credentials for ${order.customerName}`,
              customer_id: order.customerId,
              service_id: order.serviceId,
              service_name: services.find(s => s.id === order.serviceId)?.name || 'Unknown Service',
              customer_name: order.customerName,
              created_at: new Date().toISOString(),
              is_read: false,
              link_to: '/admin/stock-issues'
            });
            
          if (notificationError) {
            console.error('Error creating admin notification:', notificationError);
          }
        }
      }
      
      if (orderCredentials) {
        order.credentials = orderCredentials;
        order.status = 'completed';
        console.log('Added credentials to order:', orderCredentials);
      } else {
        order.status = 'pending';
        console.log('No credentials available, order status set to pending');
      }
      
      setOrders(prev => {
        const updatedOrders = [order, ...prev];
        return updatedOrders.slice(0, 100);
      });
      
      if (session?.session) {
        const orderInsertData = {
          id: order.id,
          wholesaler_id: session.session.user.id,
          customer_id: order.customerId,
          service_id: order.serviceId,
          quantity: order.quantity || 1,
          total_price: order.totalPrice,
          status: order.status,
          duration_months: order.durationMonths,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          customer_address: order.customerAddress,
          customer_company: order.customerCompany,
          notes: order.notes,
          credentials: order.credentials || null
        };
        
        const { error } = await supabase
          .from('wholesale_orders')
          .insert(orderInsertData);
          
        if (error) {
          console.error('Error saving order to Supabase:', error);
          toast.error('Error saving order to database');
          return;
        }
        
        const totalPrice = order.totalPrice || 0;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user balance:', profileError);
          toast.error('Error updating balance');
          return;
        }
        
        const currentBalance = profileData?.balance || 0;
        const newBalance = currentBalance - totalPrice;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', session.session.user.id);
          
        if (updateError) {
          console.error('Error updating user balance:', updateError);
          toast.error('Error updating balance');
          return;
        }
        
        localStorage.setItem(`userBalance_${session.session.user.id}`, newBalance.toString());
        
        const paymentId = `pmt-${Date.now()}`;
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            id: paymentId,
            user_id: session.session.user.id,
            amount: totalPrice,
            method: 'account_balance',
            status: 'completed',
            description: `Wholesale order for ${order.customerName || 'customer'}`,
            order_id: order.id,
            user_name: order.customerName
          });
          
        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }
        
        const service = services.find(s => s.id === order.serviceId);
        
        if (service?.type === 'subscription') {
          const durationMonths = order.durationMonths || 1;
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + durationMonths);
          
          const newSubscription: Subscription = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            userId: order.customerId,
            serviceId: order.serviceId,
            startDate: new Date().toISOString(),
            endDate: endDate.toISOString(),
            status: order.credentials ? 'active' : 'pending',
            durationMonths: durationMonths,
            credentials: order.credentials || undefined,
            isPending: !order.credentials
          };
          
          console.log('Creating new subscription for user ' + order.customerId, newSubscription);
          
          setSubscriptions(prev => {
            return [...prev, newSubscription];
          });
          
          if (session?.session) {
            try {
              const { error } = await supabase
                .from('wholesale_subscriptions')
                .insert({
                  id: newSubscription.id,
                  wholesaler_id: session.session.user.id,
                  customer_id: newSubscription.userId,
                  service_id: newSubscription.serviceId,
                  start_date: newSubscription.startDate,
                  end_date: newSubscription.endDate,
                  status: newSubscription.status,
                  duration_months: newSubscription.durationMonths,
                  credentials: newSubscription.credentials
                });
                
              if (error) {
                console.error('Error saving subscription to Supabase:', error);
                toast.error('Error saving subscription to database');
              } else {
                console.log('Subscription saved successfully to Supabase');
              }
            } catch (saveError) {
              console.error('Exception saving subscription to Supabase:', saveError);
              toast.error('Error saving subscription to database');
            }
          } else {
            console.warn('No active session, subscription only saved to local state');
          }
        }
        
        window.dispatchEvent(new CustomEvent('orderPlaced'));
        
        if (order.credentials) {
          toast.success('Order completed with credentials', {
            description: 'Credentials have been assigned from stock'
          });
        } else {
          toast.warning('Order pending', {
            description: 'No credentials available in stock. Please add credentials in the Admin Panel.'
          });
        }
      }
    } catch (error) {
      console.error('Error in handleOrderPlaced:', error);
      toast.error('Error processing order');
    }
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      setCustomersData(prev => [...prev, newCustomer]);
      console.log('Adding customer to local state:', newCustomer);
      
      const currentCustomers = localStorage.getItem('wholesaleCustomers');
      const customers = currentCustomers ? JSON.parse(currentCustomers) : [];
      localStorage.setItem('wholesaleCustomers', JSON.stringify([...customers, newCustomer]));
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session && session.session.user?.id) {
        console.log('Saving customer to Supabase with wholesaler_id:', session.session.user.id);
        
        const customerData = {
          id: newCustomer.id,
          wholesaler_id: session.session.user.id,
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          company: newCustomer.company || null,
          address: newCustomer.address || null,
          notes: newCustomer.notes || null,
          balance: newCustomer.balance || 0
        };
        
        const { data, error } = await supabase
          .from('wholesale_customers')
          .insert(customerData)
          .select();
          
        if (error) {
          console.error('Error saving customer to Supabase:', error);
          if (error.code === '23505') {
            toast.error('A customer with this ID already exists');
          } else {
            toast.error('Error saving customer to database');
          }
        } else {
          console.log('Customer saved to Supabase successfully:', data);
          toast.success('Customer added successfully');
          
          window.dispatchEvent(new CustomEvent('customerAdded', { 
            detail: { customerId: newCustomer.id, customerName: newCustomer.name }
          }));
        }
      } else {
        console.log('No authenticated session, customer saved to localStorage only');
        window.dispatchEvent(new CustomEvent('customerAdded'));
        toast.success('Customer added to local storage');
      }
    } catch (error) {
      console.error('Error in handleAddCustomer:', error);
      toast.error('Error adding customer');
    }
  };

  const handleUpdateCustomer = async (customerId: string, updatedCustomer: Partial<Customer>) => {
    try {
      setCustomersData(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, ...updatedCustomer } 
            : customer
        )
      );
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const supabaseUpdateData: any = {};
        if (updatedCustomer.name) supabaseUpdateData.name = updatedCustomer.name;
        if (updatedCustomer.email !== undefined) supabaseUpdateData.email = updatedCustomer.email || null;
        if (updatedCustomer.phone !== undefined) supabaseUpdateData.phone = updatedCustomer.phone || null;
        if (updatedCustomer.company !== undefined) supabaseUpdateData.company = updatedCustomer.company || null;
        if (updatedCustomer.address !== undefined) supabaseUpdateData.address = updatedCustomer.address || null;
        if (updatedCustomer.notes !== undefined) supabaseUpdateData.notes = updatedCustomer.notes || null;
        if (updatedCustomer.balance !== undefined) supabaseUpdateData.balance = updatedCustomer.balance;
        
        supabaseUpdateData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('wholesale_customers')
          .update(supabaseUpdateData)
          .eq('id', customerId)
          .eq('wholesaler_id', session.session.user.id);
          
        if (error) {
          console.error('Error updating customer in Supabase:', error);
          toast.error('Error updating customer in database');
        }
      }
    } catch (error) {
      console.error('Error in handleUpdateCustomer:', error);
      toast.error('Error updating customer');
    }
  };

  return {
    orders,
    subscriptions: filteredSubscriptions,
    customersData,
    wholesalerCustomers,
    isLoading,
    handleOrderPlaced,
    handleAddCustomer,
    handleUpdateCustomer
  };
}
