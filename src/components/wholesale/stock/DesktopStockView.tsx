
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Subscription } from '@/lib/types';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import { customers, products } from '@/lib/data';
import StockSubscriptionRow from './StockSubscriptionRow';

interface DesktopStockViewProps {
  filteredSubscriptions: Subscription[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allowRenewal?: boolean;
  onRenew?: (subscription: Subscription) => void;
  renewedSubscriptions?: string[];
}

const DesktopStockView: React.FC<DesktopStockViewProps> = ({
  filteredSubscriptions,
  searchTerm,
  setSearchTerm,
  allowRenewal = false,
  onRenew,
  renewedSubscriptions = []
}) => {
  const getCustomerName = (userId: string): string => {
    const customer = customers.find(c => c.id === userId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getProductName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : "Unknown Service";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Management</CardTitle>
        <CardDescription>Manage your active subscriptions and their credentials</CardDescription>
        <div className="mt-4">
          <InputWithIcon
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            type="search"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Credentials</TableHead>
              {allowRenewal && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allowRenewal ? 6 : 5} className="h-24 text-center">
                  No active subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const customerName = getCustomerName(subscription.userId);
                const productName = getProductName(subscription.serviceId);
                const isRenewed = renewedSubscriptions.includes(subscription.id);

                return (
                  <StockSubscriptionRow
                    key={subscription.id}
                    subscription={subscription}
                    customerName={customerName}
                    productName={productName}
                    onRenew={allowRenewal ? onRenew : undefined}
                    isRenewed={isRenewed}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DesktopStockView;
