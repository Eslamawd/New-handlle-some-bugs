
import React, { useState, useEffect } from 'react';
import { Customer, customers as allCustomers } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerSearchBar from './customer/CustomerSearchBar';
import CustomerList from './customer/CustomerList';
import AddCustomerButton from './customer/AddCustomerButton';
import { toast } from '@/lib/toast';

interface CustomerTableProps {
  subscriptions?: Subscription[];
  customers?: Customer[];
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
  onAddCustomer?: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
  subscriptions = [], 
  customers = allCustomers,
  wholesalerId = '',
  onPurchaseForCustomer,
  onAddCustomer,
  onUpdateCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customersList, setCustomersList] = useState<Customer[]>(customers);
  
  // Update customers list when the customers prop changes
  useEffect(() => {
    setCustomersList(customers);
  }, [customers]);

  const handleAddCustomer = (newCustomer: Customer) => {
    console.log('CustomerTable: handleAddCustomer called with', newCustomer);
    
    // Add to the customers list
    setCustomersList(prev => [...prev, newCustomer]);
    
    // Pass the new customer to the parent component if onAddCustomer is provided
    if (onAddCustomer) {
      console.log('Calling parent onAddCustomer with:', newCustomer);
      onAddCustomer(newCustomer);
      
      // Manually dispatch the customerAdded event as a fallback
      window.dispatchEvent(new CustomEvent('customerAdded'));
    } else {
      console.warn('No onAddCustomer handler provided');
      toast.warning('Customer added locally only');
    }
  };

  const handleUpdateCustomer = (customerId: string, updatedCustomer: Partial<Customer>) => {
    // Update the local state first
    setCustomersList(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, ...updatedCustomer } 
        : customer
    ));
    
    // Pass the update to the parent component if onUpdateCustomer is provided
    if (onUpdateCustomer) {
      onUpdateCustomer(customerId, updatedCustomer);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CustomerSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        <AddCustomerButton 
          onAddCustomer={handleAddCustomer} 
          wholesalerId={wholesalerId} 
        />
      </div>

      <CustomerList 
        customers={customersList}
        subscriptions={subscriptions}
        searchTerm={searchTerm}
        wholesalerId={wholesalerId}
        onPurchaseForCustomer={onPurchaseForCustomer}
        onUpdateCustomer={handleUpdateCustomer}
      />
    </div>
  );
};

export default CustomerTable;
