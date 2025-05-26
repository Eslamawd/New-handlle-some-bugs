
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, User } from "lucide-react";
import { toast } from "@/lib/toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

const RegularCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com' },
    { id: 'c2', name: 'Jane Smith', phone: '+9876543210', email: 'jane@example.com', company: 'ABC Corp' }
  ]);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });
  
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only name and phone are required
    if (newCustomer.name && newCustomer.phone) {
      setCustomers(prev => [...prev, {
        id: `c${prev.length + 1}`,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || undefined,
        company: newCustomer.company || undefined
      }]);
      
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        company: ''
      });
      
      setShowAddForm(false);
      toast.success('Customer added successfully');
    } else {
      toast.error('Name and phone number are required');
    }
  };

  const handleRemoveCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    toast.success('Customer removed successfully');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Regular Customers</CardTitle>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input 
                    id="phone" 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input 
                    id="company" 
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Customer
                </Button>
              </div>
            </form>
          </div>
        )}
      
        {customers.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No customers found</p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phone}
                      {customer.email && ` • ${customer.email}`}
                      {customer.company && ` • ${customer.company}`}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => handleRemoveCustomer(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegularCustomerManagement;
