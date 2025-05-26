
import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CustomerTable from '@/components/CustomerTable';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import ExportData from './ExportData';

interface CustomersTabProps {
  customers: Customer[];
  subscriptions: Subscription[];
  wholesalerId: string;
  onPurchaseForCustomer: (customerId: string) => void;
  onAddCustomer?: (customer: Customer) => void;
}

const CustomersTab: React.FC<CustomersTabProps> = ({ 
  customers, 
  subscriptions, 
  wholesalerId, 
  onPurchaseForCustomer,
  onAddCustomer
}) => {
  // Prepare export data - memoized to prevent recalculation on every render
  const exportData = useMemo(() => {
    if (!customers.length) return [];
    
    return customers.map(customer => {
      const customerSubscriptions = subscriptions.filter(sub => sub.userId === customer.id);
      return {
        ID: customer.id,
        Name: customer.name,
        Email: customer.email,
        Phone: customer.phone || 'N/A',
        CompanyName: customer.company || 'N/A',
        Notes: customer.notes || 'N/A',
        SubscriptionsCount: customerSubscriptions.length,
        TotalSpent: customerSubscriptions.reduce((total, sub) => {
          // No real calculation here as mentioned in the original code
          return total + 0;
        }, 0)
      };
    });
  }, [customers, subscriptions]);

  // Ensure we have a valid purchase handler
  const handlePurchaseForCustomer = React.useCallback((customerId: string) => {
    console.log('CustomersTab: Purchase for customer:', customerId);
    onPurchaseForCustomer(customerId);
  }, [onPurchaseForCustomer]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }} // Reduce animation duration
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Customers</h1>
        <div className="flex gap-2">
          <ExportData 
            data={exportData} 
            filename="wholesale-customers" 
            disabled={customers.length === 0}
          />
        </div>
      </div>
      <CustomerTable 
        subscriptions={subscriptions} 
        customers={customers} 
        wholesalerId={wholesalerId}
        onPurchaseForCustomer={handlePurchaseForCustomer}
        onAddCustomer={onAddCustomer}
      />
    </motion.div>
  );
};

export default React.memo(CustomersTab);
