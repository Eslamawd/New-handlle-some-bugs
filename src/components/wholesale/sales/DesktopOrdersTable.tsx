
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import OrderTableRow from './OrderTableRow';

interface DesktopOrdersTableProps {
  displayOrders: WholesaleOrder[];
  customerMap: Map<string, Customer>;
  productMap: Map<string, { id: string, name: string, type?: string }>;
}

const DesktopOrdersTable: React.FC<DesktopOrdersTableProps> = ({ 
  displayOrders, 
  customerMap, 
  productMap 
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            displayOrders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                customer={customerMap.get(order.customerId)}
                service={productMap.get(order.serviceId)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesktopOrdersTable;
