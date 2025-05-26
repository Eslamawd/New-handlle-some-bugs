
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Customer } from '@/lib/data';
import { toast } from '@/lib/toast';
import { v4 as uuidv4 } from 'uuid';

// Customer form schema - only requiring name and phone
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  company: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onAddCustomer: (customer: Customer) => void;
  wholesalerId: string;
  onClose: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  onAddCustomer, 
  wholesalerId,
  onClose 
}) => {
  // Setup form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      company: '',
      address: '',
    },
  });

  // Update the form submission handler to handle customer creation
  const handleAddCustomer = (data: CustomerFormValues) => {
    try {
      // Create a new customer with the form data
      // Generate a UUID instead of using a timestamp to ensure compatibility with Supabase
      const newCustomer: Customer = {
        id: uuidv4(),
        name: data.name,
        phone: data.phone,
        email: '', // Keep email field in the Customer object but always set it to empty string
        company: data.company || '',
        address: data.address || '',
        wholesalerId: wholesalerId,
        balance: 0,
        createdAt: new Date().toISOString() // Add required createdAt field
      };
      
      console.log('Creating new customer with data:', newCustomer);
      
      // Pass the new customer to the parent component
      onAddCustomer(newCustomer);
      
      // Reset form and close dialog
      form.reset();
      onClose();
      
      // Show feedback to the user
      toast.success(`Customer ${data.name} added`);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="ABC Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Customer</Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerForm;
