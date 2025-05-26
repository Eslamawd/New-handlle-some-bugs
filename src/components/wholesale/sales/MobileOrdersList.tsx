
import React from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import MobileOrderCard from './MobileOrderCard';
import { getServiceById } from '@/lib/mockData'; // Use from mockData now

interface MobileOrdersListProps {
  displayOrders: WholesaleOrder[];
  customerMap: Map<string, Customer>;
  productMap: Map<string, { id: string, name: string, type?: string, price?: number }>;
}

const MobileOrdersList: React.FC<MobileOrdersListProps> = ({ 
  displayOrders, 
  customerMap, 
  productMap 
}) => {
  return (
    <div className="p-3">
      {displayOrders.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <MobileOrderCard
              key={order.id}
              order={order}
              customer={customerMap.get(order.customerId)}
              product={productMap.get(order.serviceId)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileOrdersList;
