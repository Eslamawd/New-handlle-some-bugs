
import React from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import SalesFilters from './SalesFilters';
import OrdersTable from './OrdersTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface PurchaseHistoryProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
  filterPeriod: string;
  setFilterPeriod: (value: string) => void;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  filteredOrders,
  customers,
  searchTerm,
  setSearchTerm,
  filterCustomer,
  setFilterCustomer,
  filterPeriod,
  setFilterPeriod
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden mt-2">
      <div className="p-3 sm:p-4 border-b">
        <h2 className="text-base sm:text-lg font-medium">Purchase History</h2>
      </div>
      
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCustomer={filterCustomer}
        setFilterCustomer={setFilterCustomer}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        customers={customers}
        isMobile={isMobile}
      />
      
      <OrdersTable 
        filteredOrders={filteredOrders} 
        customers={customers} 
      />
    </div>
  );
};

export default PurchaseHistory;
