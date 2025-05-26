
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerList from '@/components/customer/CustomerList';
import AddCustomerButton from '@/components/customer/AddCustomerButton';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import StockSubscriptions from '@/components/StockSubscriptions';
import { isSubscriptionEndingSoon } from './stock/utils';

interface CustomersAndStockTabProps {
  customers: Customer[];
  subscriptions: Subscription[];
  wholesalerId: string;
  onAddCustomer?: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomersAndStockTab: React.FC<CustomersAndStockTabProps> = ({
  customers,
  subscriptions,
  wholesalerId,
  onAddCustomer,
  onUpdateCustomer,
  onPurchaseForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('customers');
  const [subscriptionCategory, setSubscriptionCategory] = useState('all');
  
  // Filter subscriptions ending soon
  const endingSoonCount = subscriptions.filter(sub => 
    isSubscriptionEndingSoon(sub, 5)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Customers & Subscriptions</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <AddCustomerButton onAddCustomer={onAddCustomer} wholesalerId={wholesalerId} />
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions Stock</TabsTrigger>
            <TabsTrigger value="ending-soon" className="relative">
              Ending Soon
              {endingSoonCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {endingSoonCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="max-w-xs">
            <InputWithIcon
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        <TabsContent value="customers" className="mt-0">
          <CustomerList
            customers={customers}
            subscriptions={subscriptions}
            searchTerm={searchTerm}
            wholesalerId={wholesalerId}
            onPurchaseForCustomer={onPurchaseForCustomer}
            onUpdateCustomer={onUpdateCustomer}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0">
          <StockSubscriptions 
            subscriptions={subscriptions}
            allowRenewal={true}
            category="all"
          />
        </TabsContent>
        
        <TabsContent value="ending-soon" className="mt-0">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-amber-800 mb-1">Ending Soon</h3>
            <p className="text-sm text-amber-700">
              This category shows subscriptions that will expire within the next 5 days. Consider renewing these subscriptions or notifying your customers.
            </p>
          </div>
          <StockSubscriptions 
            subscriptions={subscriptions}
            allowRenewal={true}
            category="ending-soon"
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CustomersAndStockTab;
