import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Subscription, Service } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Create local service lookup function
const getServiceById = (id: string): Service | null => {
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  return services.find((service: Service) => service.id === id) || null;
};

interface SubscriptionAlertProps {
  subscription: Subscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionAlert: React.FC<SubscriptionAlertProps> = ({
  subscription,
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const service = getServiceById(subscription.serviceId);

  const handleRenew = () => {
    // Navigate to service page for renewal
    navigate(`/services/${subscription.serviceId}`);
    onOpenChange(false);
    toast.success("Navigating to renewal page");
  };

  const handleCancel = () => {
    // In a real app, this would call an API to mark the subscription as canceled
    toast.success("Subscription canceled", {
      description: "Your subscription has been successfully canceled."
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <X className="h-5 w-5" />
            Expired Subscription
          </DialogTitle>
          <DialogDescription>
            Your subscription has expired on{' '}
            {format(new Date(subscription.endDate), 'MMMM dd, yyyy')}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 my-2 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h4 className="font-medium mb-2">Subscription Details</h4>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Service:</span>{' '}
              <span className="font-medium">{service?.name || "Unknown Service"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="text-red-500 font-medium">Expired</span>
            </p>
            <p>
              <span className="text-muted-foreground">End Date:</span>{' '}
              {format(new Date(subscription.endDate), 'MMMM dd, yyyy')}
            </p>
            {subscription.credentials && (
              <p>
                <span className="text-muted-foreground">Credentials:</span>{' '}
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                  {subscription.credentials.email}
                </span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Subscription
          </Button>
          <Button 
            onClick={handleRenew}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Renew Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionAlert;
