
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WholesaleOrder, Customer, Service } from '@/lib/types';
import CustomerSelector from './CustomerSelector';
import DurationSelector from './DurationSelector';
import NotesInput from './NotesInput';
import PriceDisplay from './PriceDisplay';
import ServiceDisplay from './ServiceDisplay';
import TotalPriceDisplay from './TotalPriceDisplay';
import ProductSearch from './ProductSearch';
import { v4 as uuidv4 } from 'uuid';
import { loadServices } from '@/lib/productManager';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseDialogProps {
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  customerName?: string;
  customerNotes?: string;
  serviceName?: string;
  serviceId?: string;
  service?: Service;
  duration?: number;
  customers?: Customer[];
  onCustomerChange?: (customerId: string) => void;
  selectedCustomerId?: string;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({ 
  onPurchase, 
  isSubmitting, 
  isMobile,
  open,
  onOpenChange,
  children,
  customerName = '',
  customerNotes = '',
  serviceName = '',
  serviceId = '',
  service,
  duration = 1,
  customers = [],
  onCustomerChange,
  selectedCustomerId = ''
}) => {
  const [notes, setNotes] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(duration.toString());
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | undefined>(service);
  const [userBalance, setUserBalance] = useState(0);
  const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);

  // Load available services
  useEffect(() => {
    const availableServices = loadServices();
    console.log('Available services in PurchaseDialog:', availableServices.length);
    setServices(availableServices);
  }, []);

  // Fetch user balance when dialog opens
  useEffect(() => {
    if (open) {
      fetchUserBalance();
    }
  }, [open]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNotes('');
      setSelectedDuration(duration.toString());
      setSelectedServiceId(serviceId);
      setIsInsufficientFunds(false);
    } else {
      setNotes(customerNotes || '');
      setSelectedDuration(duration.toString());
      setSelectedServiceId(serviceId);
      
      if (selectedCustomerId) {
        setSelectedCustomer(selectedCustomerId);
      }
    }
  }, [open, customerNotes, selectedCustomerId, duration, serviceId]);

  // Auto-select customer by name
  useEffect(() => {
    if (open && customerName && customers.length > 0 && !selectedCustomer) {
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        console.log('Auto-selecting customer by name:', customer.name);
        setSelectedCustomer(customer.id);
        if (onCustomerChange) onCustomerChange(customer.id);
      }
    }
  }, [customerName, customers, selectedCustomer, onCustomerChange, open]);

  // Update selected customer when prop changes
  useEffect(() => {
    if (selectedCustomerId && selectedCustomerId !== selectedCustomer) {
      console.log('Setting customer from selectedCustomerId:', selectedCustomerId);
      setSelectedCustomer(selectedCustomerId);
    }
  }, [selectedCustomerId, selectedCustomer]);

  // Update selected service when service ID changes
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const foundService = services.find(s => s.id === selectedServiceId);
      if (foundService) {
        console.log('Service selected:', foundService.name);
        setSelectedService(foundService);
      }
    }
  }, [selectedServiceId, services]);

  // Check if user has sufficient funds whenever the total price changes
  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    setIsInsufficientFunds(userBalance < totalPrice);
  }, [selectedService, selectedDuration, userBalance]);

  const fetchUserBalance = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error('No authenticated user found');
        return;
      }
      
      const userId = sessionData.session.user.id;
      console.log('Fetching balance for user:', userId);
      
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
        console.log('User balance data:', data);
        setUserBalance(data.balance || 0);
        console.log('User balance:', data.balance);
      }
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    if (onCustomerChange) {
      onCustomerChange(customerId);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    console.log('Service changed to:', serviceId);
    setSelectedServiceId(serviceId);
  };

  const calculateTotalPrice = () => {
    if (!selectedService) return 0;
    
    // Always use the wholesalePrice for this component since it's for wholesale purchases
    const basePrice = selectedService.wholesalePrice || 0;
    
    // Calculate adjusted price based on service type and duration
    const durationAdjustedPrice = selectedService.type === 'subscription' 
      ? basePrice * parseInt(selectedDuration) 
      : basePrice;
      
    return durationAdjustedPrice;
  };

  const isSubscription = selectedService?.type === 'subscription';

  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (!selectedServiceId || !selectedService) {
      toast.error("Please select a service");
      return;
    }

    const totalPrice = calculateTotalPrice();
    
    if (userBalance < totalPrice) {
      toast.error("Insufficient funds", {
        description: `Your balance ($${userBalance.toFixed(2)}) is insufficient for this purchase ($${totalPrice.toFixed(2)})`
      });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);

    // Generate a proper UUID for the order ID
    const orderId = uuidv4();

    // Use existing credentials from the stock rather than generating new ones
    const order: WholesaleOrder = {
      id: orderId,
      customerId: selectedCustomer,
      serviceId: selectedServiceId,
      quantity: 1,
      totalPrice: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: notes,
      customerName: customer?.name || 'Unknown',
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      customerCompany: customer?.company,
      durationMonths: parseInt(selectedDuration)
      // Note: We're not setting credentials here - they will be assigned from stock
    };

    console.log('Submitting order without credentials - will be assigned from stock');
    onPurchase(order);
  };

  // Log price details for debugging
  console.log('Selected service:', selectedService?.name);
  console.log('Service wholesale price:', selectedService?.wholesalePrice);
  console.log('Calculated total price:', calculateTotalPrice());
  console.log('User balance:', userBalance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {serviceName ? `Purchase ${serviceName} for your customer` : 'Enter the details to process your order'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-3 bg-muted/30 rounded-md flex justify-between items-center">
            <span className="text-sm font-medium">Your Balance:</span>
            <span className={`font-bold ${isInsufficientFunds ? 'text-red-500' : ''}`}>
              ${userBalance.toFixed(2)}
            </span>
          </div>

          <CustomerSelector 
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
          />

          <ProductSearch 
            products={services}
            selectedProductId={selectedServiceId}
            onProductSelect={handleServiceChange}
          />

          {selectedService && (
            <PriceDisplay 
              service={selectedService}
              selectedDuration={selectedDuration}
              isSubscription={isSubscription}
              calculateTotalPrice={calculateTotalPrice}
            />
          )}

          {selectedService && selectedService.type === 'subscription' && (
            <DurationSelector 
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              isSubscription={isSubscription}
            />
          )}

          <NotesInput 
            notes={notes}
            onChange={setNotes}
          />

          <TotalPriceDisplay totalPrice={calculateTotalPrice()} />

          {isInsufficientFunds && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <p className="font-medium">Insufficient funds</p>
              <p>Your balance (${userBalance.toFixed(2)}) is not enough to complete this purchase (${calculateTotalPrice().toFixed(2)}). Please add funds to your account.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedServiceId || !selectedCustomer || isInsufficientFunds}
          >
            {isSubmitting ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
