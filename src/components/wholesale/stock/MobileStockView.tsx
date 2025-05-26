
import React from 'react';
import { Subscription } from '@/lib/types';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { customers, products } from '@/lib/data';
import StockSubscriptionCard from './StockSubscriptionCard';

interface MobileStockViewProps {
  filteredSubscriptions: Subscription[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRenew?: (subscription: Subscription) => void;
  renewedSubscriptions?: string[];
}

const MobileStockView: React.FC<MobileStockViewProps> = ({
  filteredSubscriptions,
  searchTerm,
  setSearchTerm,
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
    <div className="space-y-6">
      <div className="sticky top-16 z-10 bg-background pb-4 pt-2">
        <InputWithIcon
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          type="search"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No subscriptions found matching your search.
          </CardContent>
        </Card>
      ) : (
        filteredSubscriptions.map((subscription) => {
          const customerName = getCustomerName(subscription.userId);
          const productName = getProductName(subscription.serviceId);
          const isRenewed = renewedSubscriptions.includes(subscription.id);

          return (
            <StockSubscriptionCard
              key={subscription.id}
              subscription={subscription}
              customerName={customerName}
              productName={productName}
              onRenew={onRenew}
              isRenewed={isRenewed}
            />
          );
        })
      )}
    </div>
  );
};

export default MobileStockView;
