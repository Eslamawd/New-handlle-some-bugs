
import React, { useState } from 'react';
import { Subscription, Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Clipboard, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/lib/toast';
import CredentialsDisplay from '@/components/wholesale/CredentialsDisplay';

interface ExpandedSubscriptionDetailsProps {
  subscription: Subscription;
  service?: Service;
  onClose: () => void;
  isWholesale?: boolean;
}

const ExpandedSubscriptionDetails: React.FC<ExpandedSubscriptionDetailsProps> = ({
  subscription,
  service,
  onClose,
  isWholesale = false
}) => {
  const [copyingCredentials, setCopyingCredentials] = useState(false);
  
  const formattedStartDate = new Date(subscription.startDate).toLocaleDateString();
  const formattedEndDate = new Date(subscription.endDate).toLocaleDateString();
  const daysRemaining = Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const isActive = subscription.status === 'active';
  const isExpired = subscription.status === 'expired' || new Date(subscription.endDate) < new Date();
  const isPending = subscription.status === 'pending' || subscription.isPending;
  
  const statusIcon = isActive ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                     isExpired ? <XCircle className="h-4 w-4 text-red-500" /> : 
                     <AlertCircle className="h-4 w-4 text-amber-500" />;
                     
  const statusText = isActive ? "Active" : isExpired ? "Expired" : "Pending";
  const statusColor = isActive ? "bg-green-100 text-green-800" : 
                      isExpired ? "bg-red-100 text-red-800" : 
                      "bg-amber-100 text-amber-800";

  const copyAllCredentials = () => {
    if (!subscription.credentials) return;
    
    setCopyingCredentials(true);
    
    const credentialsText = Object.entries(subscription.credentials)
      .filter(([key, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
      
    navigator.clipboard.writeText(credentialsText).then(() => {
      toast.success('All credentials copied to clipboard');
      setTimeout(() => setCopyingCredentials(false), 2000);
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {service?.name || 'Subscription Details'}
          </CardTitle>
          <Badge className={statusColor}>
            <span className="flex items-center gap-1">
              {statusIcon}
              {statusText}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Start Date:</span>
              <span>{formattedStartDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">End Date:</span>
              <span>{formattedEndDate}</span>
            </div>
            {!isExpired && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Days Remaining:</span>
                <span className={daysRemaining <= 5 ? "text-red-500 font-medium" : ""}>
                  {daysRemaining > 0 ? daysRemaining : 'Expired'}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Subscription Details</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{subscription.durationMonths || 1} month{(subscription.durationMonths || 1) > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{service?.type || 'Subscription'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs truncate max-w-[150px]" title={subscription.id}>
                  {subscription.id}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {subscription.credentials && (
          <div className="pt-2">
            <CredentialsDisplay 
              credentials={subscription.credentials}
              title="Access Credentials"
              description="Login information for this subscription"
            />
            
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={copyAllCredentials}
              >
                {copyingCredentials ? (
                  <>
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3 w-3 mr-1" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {isPending && (
          <div className="bg-amber-50 border border-amber-100 rounded p-3 text-amber-800 text-sm">
            <p className="font-medium">Pending Activation</p>
            <p className="text-xs">This subscription is waiting for credentials to be assigned.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpandedSubscriptionDetails;
