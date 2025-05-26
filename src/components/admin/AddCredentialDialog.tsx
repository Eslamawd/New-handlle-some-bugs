
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/lib/toast';
import { useServiceManager } from '@/hooks/useServiceManager';
import { Service, Credential } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface AddCredentialDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddCredentialDialog: React.FC<AddCredentialDialogProps> = ({ open, setOpen }) => {
  const { services, isLoading } = useServiceManager();
  const [selectedService, setSelectedService] = useState<string>('');
  const [credentials, setCredentials] = useState<Credential>({
    email: '',
    password: '',
    username: '',
    pinCode: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedService('');
      setCredentials({
        email: '',
        password: '',
        username: '',
        pinCode: '',
        notes: ''
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    if (!credentials.email && !credentials.username) {
      toast.error('Email or username is required');
      return;
    }

    if (!credentials.password) {
      toast.error('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Adding credential for service:', selectedService);
      
      // Get service name for better display
      const service = services.find(s => s.id === selectedService);
      const serviceName = service ? service.name : "Unknown Service";
      
      // Generate a proper UUID instead of a string ID
      const stockId = uuidv4();
      
      // Insert directly into Supabase
      const { error } = await supabase
        .from('credential_stock')
        .insert({
          id: stockId,
          service_id: selectedService,
          credentials: credentials,
          status: 'available',
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error adding credential to Supabase:', error);
        toast.error('Failed to add credential: ' + error.message);
        return;
      }
      
      toast.success('Credential added successfully');
      
      // Dispatch an event to update the UI
      window.dispatchEvent(new CustomEvent('credential-added'));
      
      setOpen(false);
    } catch (error) {
      console.error('Error adding credential:', error);
      toast.error('Failed to add credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Service Credential</DialogTitle>
          <DialogDescription>
            Add login credentials for a service to your stock
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service">Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading services...</SelectItem>
                ) : services.length === 0 ? (
                  <SelectItem value="none" disabled>No services available</SelectItem>
                ) : (
                  services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username (Optional)</Label>
            <Input
              id="username"
              value={credentials.username || ''}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="username"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pinCode">PIN Code (Optional)</Label>
            <Input
              id="pinCode"
              value={credentials.pinCode || ''}
              onChange={(e) => setCredentials({ ...credentials, pinCode: e.target.value })}
              placeholder="1234"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={credentials.notes || ''}
              onChange={(e) => setCredentials({ ...credentials, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Credential'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredentialDialog;
