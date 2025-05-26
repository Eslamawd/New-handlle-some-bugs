
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import CustomerForm from './CustomerForm';
import { Customer } from '@/lib/data';
import { toast } from '@/lib/toast';

interface AddCustomerButtonProps {
  onAddCustomer?: (customer: Customer) => void;
  wholesalerId?: string;
}

const AddCustomerButton: React.FC<AddCustomerButtonProps> = ({
  onAddCustomer,
  wholesalerId = '',
}) => {
  const [open, setOpen] = useState(false);

  const handleAddCustomer = (customer: Customer) => {
    try {
      if (onAddCustomer) {
        console.log('Adding customer:', customer);
        onAddCustomer(customer);
        
        // Explicitly dispatch the customerAdded event to ensure metrics are updated
        window.dispatchEvent(new CustomEvent('customerAdded', {
          detail: { customerId: customer.id, customerName: customer.name }
        }));
      } else {
        console.error('No onAddCustomer handler provided');
        toast.error('Error: Cannot add customer (missing handler)');
      }
      
      setOpen(false);
      toast.success(`Customer ${customer.name} added successfully`);
    } catch (error) {
      console.error('Error in handleAddCustomer:', error);
      toast.error('Error adding customer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the details of the new customer below.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          onAddCustomer={handleAddCustomer}
          wholesalerId={wholesalerId}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerButton;
