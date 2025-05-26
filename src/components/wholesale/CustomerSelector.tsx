
import React from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Customer } from '@/lib/types';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: string;
  onCustomerChange: (customerId: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerChange
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="customer">Customer</Label>
      <Select value={selectedCustomer} onValueChange={onCustomerChange}>
        <SelectTrigger id="customer">
          <SelectValue placeholder="Select a customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.length === 0 ? (
            <SelectItem value="none" disabled>No customers available</SelectItem>
          ) : (
            customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.name}</span>
                  {customer.company && (
                    <span className="text-xs text-muted-foreground">({customer.company})</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomerSelector;
