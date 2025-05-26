
import React from 'react';
import { 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const CustomerTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[250px]">Customer</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Active Subscriptions</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerTableHeader;
