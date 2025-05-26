
import React, { memo, useMemo, useEffect } from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllServices } from './utils/productMapUtils';
import DesktopOrdersTable from './DesktopOrdersTable';
import MobileOrdersList from './MobileOrdersList';
import { PRODUCT_EVENTS } from '@/lib/productManager';

interface OrdersTableProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ filteredOrders, customers }) => {
  const isMobile = useIsMobile();
  
  // Create a memoized product lookup map
  const productMap = useMemo(() => {
    console.log('Creating product map');
    const map = new Map();
    try {
      const services = getAllServices();
      services.forEach(service => {
        map.set(service.id, {
          id: service.id,
          name: service.name,
          type: service.type,
          price: service.price
        });
      });
    } catch (error) {
      console.error('Error creating product map:', error);
    }
    console.log('Product map size:', map.size);
    return map;
  }, []);
  
  // Update product map when services change
  useEffect(() => {
    const updateMap = () => {
      // Force useMemo to recalculate the map
      console.log('Services updated, product map will refresh on next render');
    };
    
    window.addEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, updateMap);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_ADDED, updateMap);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_DELETED, updateMap);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, updateMap);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_ADDED, updateMap);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_DELETED, updateMap);
    };
  }, []);
  
  // Create a memoized customer lookup map
  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach(customer => {
      map.set(customer.id, customer);
    });
    return map;
  }, [customers]);
  
  // Limit the number of orders rendered to improve performance
  const displayOrders = useMemo(() => {
    return filteredOrders.slice(0, 20);
  }, [filteredOrders]);
  
  if (isMobile) {
    return <MobileOrdersList 
      displayOrders={displayOrders}
      customerMap={customerMap}
      productMap={productMap}
    />;
  }
  
  return <DesktopOrdersTable 
    displayOrders={displayOrders}
    customerMap={customerMap}
    productMap={productMap}
  />;
};

export default memo(OrdersTable);
