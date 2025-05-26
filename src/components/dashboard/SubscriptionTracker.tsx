
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Clock, Calendar, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import NoDataMessage from '../ui/NoDataMessage';
import { formatDistanceToNow, parseISO, format, differenceInDays, addMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getCredentialsByOrderId } from '@/lib/credentialUtils';
import { Subscription, CredentialStock, Service } from '@/lib/types';
import { Link } from 'react-router-dom';
import TicketCreateDialog from '../support/TicketCreateDialog';
import Loader from '../ui/Loader';
import { useAuth } from '@/hooks/useAuth';
import CredentialDisplay from './CredentialDisplay';

interface SubscriptionTrackerProps {
  services: Service[];
}

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ services }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
    
    // Set up listeners for subscription-related events
    window.addEventListener('subscription-added', fetchSubscriptions);
    window.addEventListener('subscription-updated', fetchSubscriptions);
    window.addEventListener('subscription-deleted', fetchSubscriptions);
    
    return () => {
      window.removeEventListener('subscription-added', fetchSubscriptions);
      window.removeEventListener('subscription-updated', fetchSubscriptions);
      window.removeEventListener('subscription-deleted', fetchSubscriptions);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      if (!user) {
        console.log('No user found, loading from localStorage');
        const savedData = localStorage.getItem('subscriptions');
        if (savedData) {
          setSubscriptions(JSON.parse(savedData));
        }
        setLoading(false);
        return;
      }

      // First try to get active subscriptions from database
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*, credential_stock:credential_stock_id(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('end_date', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscriptions');
        setLoading(false);
        return;
      }

      // Now format the data
      const formattedSubscriptions: Subscription[] = subscriptionData.map(subscription => ({
        id: subscription.id,
        userId: subscription.user_id,
        serviceId: subscription.service_id,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        status: subscription.status as 'active' | 'expired' | 'cancelled',
        durationMonths: subscription.duration_months || undefined,
        credentials: subscription.credentials as any,
        credentialStatus: (subscription.credential_stock?.status || 'pending') as 'available' | 'assigned' | 'pending',
        credentialStockId: subscription.credential_stock_id || undefined
      }));

      setSubscriptions(formattedSubscriptions);
      
      // Save to localStorage as backup
      localStorage.setItem('subscriptions', JSON.stringify(formattedSubscriptions));
    } catch (error) {
      console.error('Error in fetchSubscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Check if we're in the loading state
  if (loading) {
    return <Loader text="Loading subscriptions..." />;
  }

  // Check if we have any subscriptions
  if (subscriptions.length === 0) {
    return (
      <NoDataMessage 
        title="No active subscriptions" 
        description="You don't have any active subscriptions yet."
        actionText="Browse Services"
        actionLink="/services"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="expiring-soon">Expiring Soon</TabsTrigger>
          <TabsTrigger value="credentials">My Credentials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map(subscription => {
              const service = services.find(s => s.id === subscription.serviceId);
              const endDate = parseISO(subscription.endDate);
              const daysRemaining = differenceInDays(endDate, new Date());
              const progress = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));
              
              return (
                <Card key={subscription.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service?.name || 'Unknown Service'}</CardTitle>
                      <Badge 
                        variant={
                          daysRemaining <= 3 ? "destructive" : 
                          daysRemaining <= 7 ? "outline" : 
                          "default"
                        }
                      >
                        {daysRemaining <= 0 ? 'Expired Today' : `${daysRemaining} days left`}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Expires
                          </span>
                          <span className="font-medium">
                            {format(endDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Status
                          </span>
                          <span className="font-medium flex items-center">
                            {subscription.status === 'active' ? (
                              <>
                                <CheckCircle2 className="text-green-500 h-3.5 w-3.5 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="text-yellow-500 h-3.5 w-3.5 mr-1" />
                                {subscription.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Time Remaining</span>
                          <span>{Math.max(0, daysRemaining)} days</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2" 
                          indicatorClassName={
                            daysRemaining <= 3 ? "bg-red-500" : 
                            daysRemaining <= 7 ? "bg-yellow-500" : 
                            "bg-green-500"
                          } 
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowTicketDialog(true);
                      }}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Support
                    </Button>
                    
                    <Link to={`/subscription/${subscription.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="expiring-soon">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions
              .filter(sub => {
                const daysRemaining = differenceInDays(parseISO(sub.endDate), new Date());
                return daysRemaining <= 7 && daysRemaining > 0;
              })
              .map(subscription => {
                const service = services.find(s => s.id === subscription.serviceId);
                const endDate = parseISO(subscription.endDate);
                const daysRemaining = differenceInDays(endDate, new Date());
                
                // Calculate renewal price (placeholder logic - replace with actual pricing)
                const renewalPrice = service?.price || 0;
                
                return (
                  <Card key={subscription.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-900/20">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{service?.name || 'Unknown Service'}</CardTitle>
                        <Badge variant="outline">
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="flex flex-col space-y-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                          <p className="text-sm flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              Your subscription will expire soon. Renew now to avoid service interruption.
                            </span>
                          </p>
                        </div>
                        
                        <div className="flex flex-col space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current period ends</span>
                            <span className="font-medium">{format(endDate, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renewal price</span>
                            <span className="font-medium">${renewalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-end pt-2">
                      <Link to={`/renew/${subscription.id}`}>
                        <Button>Renew Subscription</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            
            {subscriptions.filter(sub => {
              const daysRemaining = differenceInDays(parseISO(sub.endDate), new Date());
              return daysRemaining <= 7 && daysRemaining > 0;
            }).length === 0 && (
              <div className="col-span-2">
                <NoDataMessage 
                  title="No subscriptions expiring soon" 
                  description="You don't have any subscriptions that are expiring in the next 7 days."
                  icon={<CheckCircle2 className="h-12 w-12 text-green-500" />}
                />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="credentials">
          <CredentialDisplay 
            subscriptions={subscriptions} 
            services={services} 
          />
        </TabsContent>
      </Tabs>
      
      {selectedSubscription && (
        <TicketCreateDialog
          open={showTicketDialog}
          onOpenChange={setShowTicketDialog}
          serviceName={services.find(s => s.id === selectedSubscription.serviceId)?.name || ''}
          serviceId={selectedSubscription.serviceId}
        />
      )}
    </div>
  );
};

export default SubscriptionTracker;
