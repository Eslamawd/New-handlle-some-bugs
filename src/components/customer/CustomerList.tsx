
import React, { useMemo } from 'react';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CustomerTableHeader from './CustomerTableHeader';
import CustomerRow from './CustomerRow';
import { Card } from '@/components/ui/card';

interface CustomerListProps {
  customers: Customer[];
  subscriptions?: Subscription[];
  searchTerm: string;
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  searchTerm,
  wholesalerId,
  onPurchaseForCustomer,
  onUpdateCustomer,
  subscriptions = []
}) => {
  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
        (customer.company && customer.company.toLowerCase().includes(searchLower))
      );
    });
    
    // Filter by wholesaler ID if provided
    if (wholesalerId) {
      return filtered.filter(customer => customer.wholesalerId === wholesalerId);
    }
    
    return filtered;
  }, [customers, searchTerm, wholesalerId]);

  // Count active subscriptions for each customer
  const getActiveSubscriptions = (customerId: string) => {
    if (!subscriptions.length) return 0;
    
    return subscriptions.filter(sub => 
      sub.userId === customerId && 
      sub.status === 'active' &&
      new Date(sub.endDate) > new Date()
    ).length;
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-center">Active Subscriptions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map(customer => (
              <CustomerRow 
                key={customer.id}
                customer={customer}
                onPurchaseForCustomer={onPurchaseForCustomer}
                onUpdateCustomer={onUpdateCustomer}
                activeSubscriptions={getActiveSubscriptions(customer.id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CustomerList;
