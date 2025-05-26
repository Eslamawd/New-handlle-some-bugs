
import React from 'react';
import { Button } from '@/components/ui/button';
import { WholesaleOrder } from '@/lib/types';
import { Product } from '@/lib/data';

interface PurchaseHistoryListProps {
  purchaseHistory: WholesaleOrder[];
  products: Product[];
  onClose: () => void;
}

const PurchaseHistoryList: React.FC<PurchaseHistoryListProps> = ({
  purchaseHistory,
  products,
  onClose
}) => {
  return (
    <div className="p-4 bg-muted/40 rounded-md space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Purchase History</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <div className="max-h-40 overflow-y-auto space-y-2">
        {purchaseHistory.length > 0 ? (
          purchaseHistory.map((order) => (
            <div key={order.id} className="text-xs p-2 bg-background rounded border">
              <div className="flex justify-between">
                <span className="font-medium">
                  {products.find(p => p.id === order.serviceId)?.name}
                </span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Qty: {order.quantity}</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No purchase history found
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(PurchaseHistoryList);
