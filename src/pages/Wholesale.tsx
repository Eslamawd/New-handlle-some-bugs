
import React, { useEffect, useState } from 'react';
import { customers as defaultCustomers } from '@/lib/data';
import WholesaleAuth from '@/components/wholesale/WholesaleAuth';
import WholesaleTabContent from '@/components/wholesale/WholesaleTabContent';
import WholesaleLayout from '@/components/wholesale/WholesaleLayout';
import { useWholesaleAuth } from '@/hooks/useWholesaleAuth';
import { useWholesaleData } from '@/hooks/useWholesaleData';
import { useWholesaleSidebar } from '@/hooks/useWholesaleSidebar';
import PurchaseDialog from '@/components/wholesale/PurchaseDialog';
import { Service, WholesaleOrder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

const loadServices = (): Service[] => {
  try {
    const storedServices = localStorage.getItem('services');
    const services = storedServices ? JSON.parse(storedServices) : [];
    console.log(`Loaded ${services.length} services from localStorage`);
    return services;
  } catch (error) {
    console.error('Error loading services:', error);
    return [];
  }
};

const Wholesale = () => {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    isAuthenticated, 
    currentWholesaler, 
    handleLoginSuccess, 
    handleLogout,
    isLoggedOut
  } = useWholesaleAuth();
  
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar
  } = useWholesaleSidebar();
  
  const {
    orders,
    subscriptions,
    customersData,
    wholesalerCustomers,
    handleOrderPlaced,
    handleAddCustomer,
    handleUpdateCustomer
  } = useWholesaleData(currentWholesaler);

  useEffect(() => {
    const services = loadServices();
    console.log('Services loaded for display:', services.length);
    setAvailableServices(services);
    
    const handleServiceUpdated = () => {
      const updatedServices = loadServices();
      console.log('Services updated:', updatedServices.length);
      setAvailableServices(updatedServices);
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

  // Fetch user balance
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBalance();
    }
  }, [isAuthenticated]);

  const fetchUserBalance = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.error('No authenticated user found');
        return;
      }
      
      const userId = session.session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user balance:', error);
        return;
      }
      
      if (data) {
        setUserBalance(data.balance || 0);
        console.log('User balance:', data.balance);
      }
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
    }
  };

  useEffect(() => {
    const handleOpenPurchaseDialog = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        console.log('Opening purchase dialog with details:', customEvent.detail);
        
        if (customEvent.detail) {
          if (customEvent.detail.customerId) {
            setSelectedCustomerId(customEvent.detail.customerId);
            
            const customer = wholesalerCustomers.find(c => c.id === customEvent.detail.customerId);
            if (customer) {
              setCustomerName(customer.name || '');
              console.log('Found customer by ID:', customer.name);
            }
          } else {
            setSelectedCustomerId('');
          }
          
          if (customEvent.detail.customerName) {
            setCustomerName(customEvent.detail.customerName);
            
            if (!customEvent.detail.customerId) {
              const customer = wholesalerCustomers.find(c => c.name === customEvent.detail.customerName);
              if (customer) {
                setSelectedCustomerId(customer.id);
                console.log('Auto-matched customer ID from name:', customer.id);
              }
            }
          }
          
          console.log('Selected customer ID:', customEvent.detail.customerId || selectedCustomerId);
          console.log('Customer name set to:', customEvent.detail.customerName || customerName);
        }
        
        setPurchaseDialogOpen(true);
      } catch (error) {
        console.error('Error opening purchase dialog:', error);
      }
    };

    window.addEventListener('openPurchaseDialog', handleOpenPurchaseDialog);

    return () => {
      window.removeEventListener('openPurchaseDialog', handleOpenPurchaseDialog);
    };
  }, [wholesalerCustomers, selectedCustomerId, customerName]);

  const handlePurchaseForCustomer = (customerId: string) => {
    try {
      // Check if user has sufficient balance before opening dialog
      if (userBalance <= 0) {
        toast.error("Insufficient funds", {
          description: "Your account has no funds. Please add funds before making a purchase."
        });
        return;
      }
      
      const customer = wholesalerCustomers.find(c => c.id === customerId);
      if (customer) {
        setCustomerName(customer.name || '');
        console.log('Found customer for purchase:', customer.name);
      } else {
        console.warn('Customer not found for ID:', customerId);
      }
      
      setSelectedCustomerId(customerId);
      setPurchaseDialogOpen(true);
      console.log('Opening purchase dialog for customer ID:', customerId);
    } catch (error) {
      console.error('Error handling purchase for customer:', error);
    }
  };
  
  const handlePurchaseSubmit = (order: WholesaleOrder) => {
    setIsSubmitting(true);
    
    handleOrderPlaced(order);
    console.log('Order placed successfully:', order);
    
    // Refresh balance after purchase
    setTimeout(() => {
      fetchUserBalance();
      setIsSubmitting(false);
      setPurchaseDialogOpen(false);
    }, 1000);
  };

  if (!isAuthenticated) {
    return <WholesaleAuth onLoginSuccess={handleLoginSuccess} isLoggedOut={isLoggedOut} />;
  }

  return (
    <>
      <WholesaleLayout
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      >
        <PurchaseDialog
          customerName={customerName}
          customerNotes={customerNotes}
          onPurchase={handlePurchaseSubmit}
          isSubmitting={isSubmitting}
          isMobile={false}
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          customers={wholesalerCustomers}
          selectedCustomerId={selectedCustomerId}
          onCustomerChange={(id) => setSelectedCustomerId(id)}
        >
          <Button 
            variant="default" 
            className="mb-4"
            onClick={() => {
              if (userBalance <= 0) {
                toast.error("Insufficient funds", {
                  description: "Your account has no funds. Please add funds before making a purchase."
                });
                return;
              }
              setPurchaseDialogOpen(true);
            }}
          >
            Create New Purchase
          </Button>
        </PurchaseDialog>
        
        <WholesaleTabContent 
          activeTab={activeTab}
          products={availableServices}
          customers={customersData}
          wholesalerCustomers={wholesalerCustomers}
          orders={orders}
          subscriptions={subscriptions}
          currentWholesaler={currentWholesaler}
          handleOrderPlaced={handleOrderPlaced}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onPurchaseForCustomer={handlePurchaseForCustomer}
        />
      </WholesaleLayout>
    </>
  );
};

export default React.memo(Wholesale);
