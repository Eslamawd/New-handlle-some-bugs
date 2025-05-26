
import React from 'react';
import { Search, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/lib/data';

interface SalesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
  filterPeriod: string;
  setFilterPeriod: (value: string) => void;
  customers: Customer[];
  isMobile?: boolean;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterCustomer,
  setFilterCustomer,
  filterPeriod,
  setFilterPeriod,
  customers,
  isMobile = false
}) => {
  return (
    <div className={`p-3 sm:p-4 border-b grid grid-cols-1 ${isMobile ? 'gap-3' : 'sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4'}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search orders..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time period" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SalesFilters;
