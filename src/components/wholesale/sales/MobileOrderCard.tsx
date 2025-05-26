
import React, { memo } from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';

interface MobileOrderCardProps {
  order: WholesaleOrder;
  customer: Customer | undefined;
  product: { id: string, name: string, type?: string } | undefined;
}

const MobileOrderCard: React.FC<MobileOrderCardProps> = ({ order, customer, product }) => {
  return (
    <div key={order.id} className="border rounded-md p-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{product?.name || "Unknown Product"}</h3>
          <p className="text-sm text-muted-foreground">{customer?.name || "Unknown"}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          order.status === 'completed' ? 'bg-green-100 text-green-800' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          'bg-amber-100 text-amber-800'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-sm">
        <div>
          <span className="text-muted-foreground">Order ID:</span>
          <span className="font-mono ml-1 text-xs">{order.id.substring(0, 8)}...</span>
        </div>
        <div>
          <span className="text-muted-foreground">Date:</span>
          <span className="ml-1">{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Quantity:</span>
          <span className="ml-1">{order.quantity}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Total:</span>
          <span className="ml-1 font-semibold">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(MobileOrderCard);
