
import React, { useState, useEffect } from 'react';
import { MoreHorizontal, PlusCircle, CreditCard, PackageOpen, Edit, Trash } from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/lib/data';
import { loadServices } from '@/lib/productManager';
import { Service } from '@/lib/types';
import CustomerSearchBar from './CustomerSearchBar';

interface CustomerActionsMenuProps {
  customer: Customer;
  onPurchaseForCustomer?: (customerId: string) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onCopyContact?: () => void; // Add this line to fix the type error
}

const CustomerActionsMenu: React.FC<CustomerActionsMenuProps> = ({
  customer,
  onPurchaseForCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer>({ ...customer });
  
  // Purchase form state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const [credential1, setCredential1] = useState<string>("");
  const [credential2, setCredential2] = useState<string>("");
  const [availableProducts, setAvailableProducts] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Load all available products
  useEffect(() => {
    const loadAllProducts = () => {
      try {
        const products = loadServices();
        const productsForCustomers = products.filter(product => 
          product.availableForCustomers !== false
        );
        setAvailableProducts(productsForCustomers);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    
    loadAllProducts();
    
    // Listen for product updates
    window.addEventListener('service-updated', loadAllProducts);
    window.addEventListener('service-added', loadAllProducts);
    window.addEventListener('service-deleted', loadAllProducts);
    
    return () => {
      window.removeEventListener('service-updated', loadAllProducts);
      window.removeEventListener('service-added', loadAllProducts);
      window.removeEventListener('service-deleted', loadAllProducts);
    };
  }, []);

  // Filter products based on search term
  const filteredProducts = availableProducts.filter(product => 
    searchTerm === "" || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.categoryId && product.categoryId.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Grouped products by type
  const subscriptionProducts = filteredProducts.filter(product => product.type === "subscription");
  const otherProducts = filteredProducts.filter(product => product.type !== "subscription");

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCustomer) {
      onUpdateCustomer(customer.id, editedCustomer);
      setShowEditDialog(false);
      toast.success(`Customer ${customer.name} updated`);
    }
  };

  const handleDelete = () => {
    if (onDeleteCustomer) {
      onDeleteCustomer(customer.id);
      toast.success(`Customer ${customer.name} deleted`);
    }
    setShowDeleteDialog(false);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    
    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
    
    // For subscription type products, validate credentials
    if (selectedProduct?.type === "subscription" && (!credential1 || !credential2)) {
      toast.error("Please enter both username and password");
      return;
    }
    
    // Simulate purchase by triggering onPurchaseForCustomer
    if (onPurchaseForCustomer) {
      onPurchaseForCustomer(customer.id);
      
      // Reset form
      setSelectedProductId("");
      setSelectedDuration("1");
      setCredential1("");
      setCredential2("");
      setShowPurchaseDialog(false);
      
      toast.success(`Purchase for ${customer.name} completed successfully`);
    }
  };

  // Determine if there are any products
  const hasProducts = filteredProducts.length > 0;
  const hasSubscriptions = subscriptionProducts.length > 0;
  const hasOtherProducts = otherProducts.length > 0;
  
  const initialTab = hasSubscriptions ? "subscriptions" : "other";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onPurchaseForCustomer && (
            <>
              <DropdownMenuItem onClick={() => setShowPurchaseDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase for Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </DropdownMenuItem>
          
          {onDeleteCustomer && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Customer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer.name}'s account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editedCustomer.name}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedCustomer.email || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editedCustomer.phone || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={editedCustomer.company || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, company: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={editedCustomer.notes || ''}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase for Customer Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Purchase for {customer.name}</DialogTitle>
            <DialogDescription>
              Select a product or service to purchase for this customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <form onSubmit={handlePurchaseSubmit}>
              <CustomerSearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
              />
              
              {!hasProducts ? (
                <div className="text-center py-4 text-muted-foreground">
                  No products available for purchase
                </div>
              ) : (
                <Tabs defaultValue={initialTab} className="mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    {hasSubscriptions && (
                      <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    )}
                    {hasOtherProducts && (
                      <TabsTrigger value="other">Other Products</TabsTrigger>
                    )}
                  </TabsList>
                  
                  {hasSubscriptions && (
                    <TabsContent value="subscriptions" className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="subscription">Select Subscription</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Streaming Services</SelectLabel>
                              {subscriptionProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="duration">Duration (months)</Label>
                        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username/Email</Label>
                        <Input
                          id="username"
                          value={credential1}
                          onChange={(e) => setCredential1(e.target.value)}
                          placeholder="Username or Email"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={credential2}
                          onChange={(e) => setCredential2(e.target.value)}
                          placeholder="Password"
                        />
                      </div>
                    </TabsContent>
                  )}
                  
                  {hasOtherProducts && (
                    <TabsContent value="other" className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="product">Select Product</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Products</SelectLabel>
                              {otherProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Select defaultValue="1">
                          <SelectTrigger>
                            <SelectValue placeholder="Select quantity..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              )}
              
              {selectedProductId && (
                <div className="mt-4 p-4 bg-muted/40 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      ${availableProducts.find(p => p.id === selectedProductId)?.price.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total price:</span>
                    <span className="text-primary">
                      ${(availableProducts.find(p => p.id === selectedProductId)?.price || 0) * parseInt(selectedDuration || "1")}
                    </span>
                  </div>
                </div>
              )}
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!hasProducts}>Complete Purchase</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerActionsMenu;
