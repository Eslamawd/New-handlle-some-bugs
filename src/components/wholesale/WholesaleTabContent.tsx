
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CustomerTable from '@/components/CustomerTable';
import { Customer as DataCustomer } from '@/lib/data';
import { Subscription, WholesaleOrder, Service, ServiceType, Customer } from '@/lib/types';
import ProductsTab from './ProductsTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';
import { toast } from '@/lib/toast';
import { getAllServices } from './sales/utils/productMapUtils';
import CustomersAndStockTab from './CustomersAndStockTab';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Service[];
  customers: DataCustomer[];
  wholesalerCustomers: DataCustomer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
  onAddCustomer: (customer: DataCustomer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<DataCustomer>) => void;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const WholesaleTabContent: React.FC<WholesaleTabContentProps> = ({ 
  activeTab,
  products,
  customers,
  wholesalerCustomers,
  orders,
  subscriptions,
  currentWholesaler,
  handleOrderPlaced,
  onAddCustomer,
  onUpdateCustomer,
  onPurchaseForCustomer
}) => {
  // Log products to help with debugging
  React.useEffect(() => {
    console.log('Products received in WholesaleTabContent:', products.length);
    console.log('Wholesale customers count:', wholesalerCustomers.length);
  }, [products, wholesalerCustomers]);

  // Get all available services using the utility function
  const allServices = React.useMemo(() => {
    try {
      const servicesList = getAllServices();
      console.log('Services count from getAllServices:', servicesList.length);
      return servicesList;
    } catch (error) {
      console.error('Error processing services:', error);
      toast.error('Error loading services');
      return [] as Service[];
    }
  }, []);

  // Convert data.ts Customer type to data.ts Customer type (keeping the same type)
  // Removed the conversion to types.ts Customer since it causes type issues
  const typedCustomers = React.useMemo(() => {
    return customers;
  }, [customers]);

  // Add the combined services array using both products and allServices
  const combinedServices = React.useMemo(() => {
    const combined = [...products];
    
    // Add services from allServices that aren't already in products
    allServices.forEach(service => {
      const exists = combined.some(p => p.id === service.id);
      if (!exists) {
        combined.push(service);
      }
    });
    
    console.log('Combined services count:', combined.length);
    return combined;
  }, [products, allServices]);

  return (
    <div className="h-full">
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value="dashboard" className="h-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Dashboard content */}
            <h2>Dashboard content</h2>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="h-full">
          <ProductsTab 
            customers={wholesalerCustomers as unknown as Customer[]}
            onOrderPlaced={handleOrderPlaced}
            services={combinedServices}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="h-full">
          <CustomersAndStockTab 
            customers={typedCustomers}
            wholesalerId={currentWholesaler}
            subscriptions={subscriptions}
            onAddCustomer={onAddCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onPurchaseForCustomer={onPurchaseForCustomer}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="h-full">
          <SalesTab 
            orders={orders}
            customers={wholesalerCustomers}
            wholesalerId={currentWholesaler}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="h-full">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WholesaleTabContent;
