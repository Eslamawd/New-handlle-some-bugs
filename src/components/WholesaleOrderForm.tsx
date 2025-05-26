import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { WholesaleOrder } from '@/lib/types';
import { Product, Customer, customers as allCustomers } from '@/lib/data';
import { Plus, User, ChevronDown } from 'lucide-react';
import CustomerSubscriptions from './CustomerSubscriptions';

const newCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
});

type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;

const formSchema = z.object({
  productId: z.string({ required_error: "Please select a product" }),
  customerId: z.string({ required_error: "Please select a customer" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  credentials: z.object({
    email: z.string().email("Please enter a valid email").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WholesaleOrderFormProps {
  products: Product[];
  onOrderPlaced: (order: WholesaleOrder) => void;
  subscriptions?: any[]; // Mock subscriptions for demo
  wholesalerId?: string;
  customers?: Customer[];
}

const WholesaleOrderForm: React.FC<WholesaleOrderFormProps> = ({
  products,
  onOrderPlaced,
  subscriptions = [],
  wholesalerId = '',
  customers = allCustomers
}) => {
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>(customers);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [includeCredentials, setIncludeCredentials] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const newCustomerForm = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    const product = products.find(p => p.id === values.productId);
    
    if (!product) {
      toast.error("Product not found. Please select a valid product.");
      console.error("Product not found for ID:", values.productId);
      return;
    }

    if (!customersList.find(c => c.id === values.customerId)) {
      toast.error("Customer not found. Please select a valid customer.");
      return;
    }

    console.log("Creating order with product:", product.name, "and customer:", values.customerId);
    
    const newOrder: WholesaleOrder = {
      id: `order-${Date.now()}`,
      userId: wholesalerId,
      wholesalerId: wholesalerId,
      serviceId: values.productId,
      customerId: values.customerId,
      quantity: values.quantity,
      totalPrice: (product.wholesalePrice || 0) * values.quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (includeCredentials && values.credentials) {
      newOrder.credentials = {
        email: values.credentials.email || '',
        password: values.credentials.password || '',
      };
    }

    onOrderPlaced(newOrder);
    form.reset();
    setIncludeCredentials(false);
    toast.success(`Order placed for ${customersList.find(c => c.id === values.customerId)?.name}`);
  };

  const handleAddNewCustomer = (data: NewCustomerFormValues) => {
    const newCustomerId = `customer-${Date.now()}`;
    
    const newCustomer: Customer = {
      id: newCustomerId,
      name: data.name,
      email: data.email || '',
      phone: data.phone,
      company: data.company || '',
      wholesalerId: wholesalerId,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    setCustomersList(prev => [...prev, newCustomer]);
    form.setValue('customerId', newCustomerId);
    setSelectedCustomerId(newCustomerId);
    setIsNewCustomerDialogOpen(false);
    newCustomerForm.reset();
    toast.success(`New customer ${data.name} added successfully`);
  };

  const handleCustomerChange = (customerId: string) => {
    form.setValue('customerId', customerId);
    setSelectedCustomerId(customerId);
    setShowSubscriptions(false);
  };

  const toggleSubscriptions = () => {
    setShowSubscriptions(!showSubscriptions);
  };

  const selectedProduct = form.watch('productId') 
    ? products.find(p => p.id === form.watch('productId')) 
    : null;

  const selectedCustomer = selectedCustomerId
    ? customersList.find(c => c.id === selectedCustomerId)
    : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-medium mb-6">New Wholesale Order</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCustomerId(value);
                      setShowSubscriptions(false);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customersList.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground">{customer.company || ""}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                          Enter the details of your new customer below.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...newCustomerForm}>
                        <form onSubmit={newCustomerForm.handleSubmit(handleAddNewCustomer)} className="space-y-4">
                          <FormField
                            control={newCustomerForm.control}
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
                            control={newCustomerForm.control}
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
                            control={newCustomerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newCustomerForm.control}
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
                          
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Customer</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCustomer && (
            <div className="bg-muted/40 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={toggleSubscriptions}
                  className="flex items-center gap-1"
                >
                  <span>Subscriptions</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSubscriptions ? 'transform rotate-180' : ''}`} />
                </Button>
              </div>

              {showSubscriptions && (
                <div className="mt-4">
                  <CustomerSubscriptions 
                    subscriptions={subscriptions} 
                    customerId={selectedCustomerId || ''}
                  />
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.wholesalePrice.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2 my-4">
            <input
              type="checkbox"
              id="includeCredentials"
              checked={includeCredentials}
              onChange={() => setIncludeCredentials(!includeCredentials)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="includeCredentials" className="text-sm font-medium">
              Include credentials for this order
            </label>
          </div>

          {includeCredentials && (
            <div className="p-4 border rounded-md border-muted space-y-4">
              <h3 className="text-sm font-medium">Service Credentials</h3>
              
              <FormField
                control={form.control}
                name="credentials.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email/Username</FormLabel>
                    <FormControl>
                      <Input placeholder="service@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="credentials.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedProduct && (
            <div className="mt-4 p-4 bg-muted/40 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Price per unit:</span>
                <span className="font-medium">${selectedProduct.wholesalePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span className="text-primary">
                  ${(selectedProduct.wholesalePrice * (form.watch('quantity') || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-2">Place Order</Button>
        </form>
      </Form>
    </div>
  );
};

export default WholesaleOrderForm;
