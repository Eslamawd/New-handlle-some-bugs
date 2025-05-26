
import React, { useState } from 'react';
import { Subscription } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { filterSubscriptions } from './wholesale/stock/utils';
import MobileStockView from './wholesale/stock/MobileStockView';
import DesktopStockView from './wholesale/stock/DesktopStockView';

interface StockSubscriptionsProps {
  subscriptions: Subscription[];
  allowRenewal?: boolean;
  onRenew?: (subscription: Subscription) => void;
  renewedSubscriptions?: string[];
  category?: string;
}

const StockSubscriptions: React.FC<StockSubscriptionsProps> = ({
  subscriptions,
  allowRenewal = false,
  onRenew,
  renewedSubscriptions = [],
  category = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Filter subscriptions based on search term and category
  const filteredSubscriptions = filterSubscriptions(subscriptions, searchTerm, category);

  // Render appropriate view based on device type
  if (isMobile) {
    return (
      <MobileStockView 
        filteredSubscriptions={filteredSubscriptions}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRenew={allowRenewal ? onRenew : undefined}
        renewedSubscriptions={renewedSubscriptions}
      />
    );
  }

  // Desktop view
  return (
    <DesktopStockView 
      filteredSubscriptions={filteredSubscriptions}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      allowRenewal={allowRenewal}
      onRenew={onRenew}
      renewedSubscriptions={renewedSubscriptions}
    />
  );
};

export default StockSubscriptions;
