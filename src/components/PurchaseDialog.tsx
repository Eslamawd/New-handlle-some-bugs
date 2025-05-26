
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { Service, ServiceType } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PurchaseSuccessDialog from '@/components/PurchaseSuccessDialog';
import { externalApi } from '@/lib/externalApi';

interface PurchaseDialogProps {
  service: Service;
  quantity: number;
  duration: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: () => void;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  service,
  quantity: initialQuantity,
  duration: initialDuration,
  open,
  onOpenChange,
  onPurchase,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [duration, setDuration] = useState(initialDuration.toString());
  const [availableDurations, setAvailableDurations] = useState<string[]>(['1', '3', '6', '12']);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [credentials, setCredentials] = useState<{email?: string, password?: string, username?: string, notes?: string} | undefined>();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [stockAvailable, setStockAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setQuantity(initialQuantity);
      setDuration(initialDuration.toString());
      setAccountId('');
      setNotes('');
      setStockAvailable(true);
    }
  }, [open, initialQuantity, initialDuration]);

  const calculateTotalPrice = () => {
    if (service.type === 'subscription') {
      return service.price * parseInt(duration);
    } else {
      return service.price * quantity;
    }
  };

  const totalPrice = calculateTotalPrice();
  
  const checkStockAvailability = async (serviceId: string) => {
    // For external API services, we don't need to check stock
    if (service.type === 'topup' || service.type === 'recharge' || service.useExternalApi) {
      return true;
    }
    
    try {
      const { data, error } = await supabase
        .from('credential_stock')
        .select('id')
        .eq('service_id', serviceId)
        .eq('status', 'available')
        .limit(1);
      
      if (error) {
        console.error('Error checking stock:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error in checkStockAvailability:', error);
      return false;
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('You must be logged in to make a purchase');
      return;
    }
    
    if (service.requiresId && !accountId.trim()) {
      toast.error('Please enter your account ID');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Check stock availability
      const stockCheck = await checkStockAvailability(service.id);
      setStockAvailable(stockCheck);
      
      if (!stockCheck && (service.type as string) === 'subscription') {
        setOrderStatus('pending');
        toast.error('This service is currently out of stock. Your order will be placed and fulfilled as soon as stock becomes available.');
      }
      
      // Create order ID
      const newOrderId = `order-${Date.now()}`;
      setOrderId(newOrderId);
      
      // Create an order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          user_id: user.id,
          service_id: service.id,
          service_name: service.name,
          quantity: quantity,
          duration_months: parseInt(duration),
          total_price: totalPrice,
          status: stockCheck ? 'processing' : 'pending',
          account_id: accountId || null,
          notes: notes || null,
          created_at: new Date().toISOString()
        });
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        toast.error('Failed to create order');
        setIsProcessing(false);
        return;
      }
      
      // If stock is available, assign credentials
      if (stockCheck && (service.type as string) === 'subscription') {
        try {
          const { data: credentialAssignment, error: assignError } = await supabase
            .rpc('assign_credential', {
              p_service_id: service.id,
              p_user_id: user.id,
              p_order_id: newOrderId
            });
          
          if (assignError) {
            console.error('Error assigning credential:', assignError);
          } else if (credentialAssignment) {
            // Update order status to completed
            await supabase
              .from('orders')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', newOrderId);
            
            // Get the assigned credential details
            const { data: credentialData } = await supabase
              .from('credential_stock')
              .select('credentials')
              .eq('id', credentialAssignment)
              .single();
            
            if (credentialData) {
              // Fix for TS2345 error - handle JSON from Supabase
              if (typeof credentialData.credentials === 'string') {
                try {
                  setCredentials(JSON.parse(credentialData.credentials));
                } catch (e) {
                  setCredentials({});
                }
              } else {
                setCredentials(credentialData.credentials as any);
              }
            }
            
            setOrderStatus('completed');
          }
        } catch (assignmentError) {
          console.error('Error in credential assignment process:', assignmentError);
        }
      } else if (service.type === 'topup' || service.type === 'recharge' || service.useExternalApi) {
        // For topup/recharge, just mark order as completed
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', newOrderId);
        
        setOrderStatus('completed');
      } else {
        // Handle case for subscription services when stock is unavailable
        // Create stock request
        try {
          const { error: stockRequestError } = await supabase
            .from('stock_issue_logs')
            .insert({
              user_id: user.id,
              service_id: service.id,
              order_id: newOrderId,
              status: 'pending',
              notes: 'Automatic request due to empty stock'
            });
          
          if (stockRequestError) {
            console.error('Error creating stock request:', stockRequestError);
          }
          
          // Create admin notification
          await supabase
            .from('admin_notifications')
            .insert({
              type: 'stock',
              title: 'Stock Replenishment Needed',
              message: `A customer has purchased ${service.name} but stock is empty.`,
              user_id: user.id,
              service_id: service.id,
              service_name: service.name,
              is_read: false
            });
        } catch (stockRequestError) {
          console.error('Error creating stock request:', stockRequestError);
        }
      }
      
      // Show success dialog
      setShowSuccessDialog(true);
      onPurchase();
    } catch (error) {
      console.error('Error in purchase process:', error);
      toast.error('An error occurred during the purchase process');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Review your order details and confirm your purchase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between mb-1 text-sm">
                <span>Service:</span>
                <span className="font-medium">{service.name}</span>
              </div>
              
              {service.type === 'subscription' && (
                <div className="flex justify-between mb-1 text-sm">
                  <span>Duration:</span>
                  <span>{duration} {parseInt(duration) === 1 ? 'month' : 'months'}</span>
                </div>
              )}
              
              <div className="flex justify-between mb-1 text-sm">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {service.type === 'subscription' && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="duration">Subscription Duration</Label>
                <Select
                  value={duration}
                  onValueChange={setDuration}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.availableMonths ? (
                      service.availableMonths.map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} {month === 1 ? 'month' : 'months'}
                        </SelectItem>
                      ))
                    ) : (
                      availableDurations.map(month => (
                        <SelectItem key={month} value={month}>
                          {month} {month === '1' ? 'month' : 'months'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {service.type !== 'subscription' && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
            
            {service.requiresId && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="accountId">
                  Account ID / Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountId"
                  placeholder="Your account ID for this service"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This is required to link the service to your account.
                </p>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any special instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={isProcessing || (service.requiresId && !accountId.trim())}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {showSuccessDialog && orderId && (
        <PurchaseSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          service={service}
          orderId={orderId}
          orderStatus={orderStatus}
          stockAvailable={stockAvailable}
          credentials={credentials}
        />
      )}
    </>
  );
};

export default PurchaseDialog;
