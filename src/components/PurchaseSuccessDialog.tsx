
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Service } from '@/lib/types';
import { Check, Clock, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export interface PurchaseSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  orderId: string;
  orderStatus: 'pending' | 'processing' | 'completed';
  stockAvailable: boolean;
  credentials?: {
    email?: string;
    password?: string;
    username?: string;
    pinCode?: string;
    notes?: string;
  };
}

const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  open,
  onOpenChange,
  service,
  orderId,
  orderStatus,
  stockAvailable,
  credentials
}) => {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {orderStatus === 'completed' ? (
              <Check className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            )}
            Order {orderStatus === 'completed' ? 'Complete' : 'Received'}
          </DialogTitle>
          <DialogDescription>
            {orderStatus === 'completed'
              ? 'Your purchase has been completed successfully'
              : 'Your order has been received and is being processed'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between mb-1 text-sm">
              <span>Order ID:</span>
              <span className="font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Service:</span>
              <span>{service.name}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Status:</span>
              <span className={`font-medium ${
                orderStatus === 'completed' ? 'text-green-500' : 
                orderStatus === 'processing' ? 'text-blue-500' : 
                'text-yellow-500'
              }`}>
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </span>
            </div>
          </div>
          
          {orderStatus === 'completed' && service.type === 'subscription' && credentials && (
            <div className="border p-3 rounded-md space-y-2">
              <div className="font-medium mb-2">Your Account Credentials</div>
              
              {credentials.email && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Email:</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopyToClipboard(credentials.email || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono">{credentials.email}</div>
                </div>
              )}
              
              {credentials.password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Password:</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopyToClipboard(credentials.password || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono">{credentials.password}</div>
                </div>
              )}
              
              {credentials.username && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Username:</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopyToClipboard(credentials.username || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono">{credentials.username}</div>
                </div>
              )}
              
              {credentials.pinCode && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>PIN:</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopyToClipboard(credentials.pinCode || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-muted p-2 rounded text-xs font-mono">{credentials.pinCode}</div>
                </div>
              )}
              
              {credentials.notes && (
                <div className="space-y-1">
                  <div className="text-sm">Notes:</div>
                  <div className="bg-muted p-2 rounded text-xs">{credentials.notes}</div>
                </div>
              )}
            </div>
          )}
          
          {!stockAvailable && orderStatus !== 'completed' && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                This service is currently out of stock. Your order will be fulfilled as soon as stock becomes available.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseSuccessDialog;
