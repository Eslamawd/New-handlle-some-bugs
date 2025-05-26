import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Subscription, Service } from '@/lib/types';
import CustomerCredentials from './CustomerCredentials';
import { loadServices } from '@/lib/productManager';

const DashboardCredentials: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  useEffect(() => {
    setServices(loadServices());
    
    // Listen for service updates
    const handleServiceUpdated = () => {
      setServices(loadServices());
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching subscriptions:', error);
        } else if (data) {
          // Transform data to match Subscription interface
          const transformedData: Subscription[] = data.map(sub => ({
            id: sub.id,
            userId: sub.user_id,
            serviceId: sub.service_id,
            startDate: sub.start_date,
            endDate: sub.end_date,
            status: sub.status as 'active' | 'expired' | 'cancelled' | 'pending',
            durationMonths: sub.duration_months,
            credentials: sub.credentials ? (
              typeof sub.credentials === 'string' 
                ? JSON.parse(sub.credentials) 
                : sub.credentials
            ) : undefined,
            credentialStockId: sub.credential_stock_id,
            isPending: sub.status === 'pending'
          }));
          
          setSubscriptions(transformedData);
          
          // Set first subscription as default tab
          if (transformedData.length > 0 && !selectedTab) {
            setSelectedTab(transformedData[0].id);
          }
        }
      } catch (error) {
        console.error('Error in fetchSubscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
    
    // Listen for subscription updates
    const subscriptionsChannel = supabase
      .channel('subscriptions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchSubscriptions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [user, selectedTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>You don't have any active subscriptions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            Purchase a subscription to see your credentials here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscriptions</CardTitle>
        <CardDescription>Access your subscription details and credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab || undefined} onValueChange={setSelectedTab}>
          <TabsList className="mb-4 w-full flex overflow-x-auto">
            {subscriptions.map(subscription => {
              const service = services.find(s => s.id === subscription.serviceId);
              return (
                <TabsTrigger key={subscription.id} value={subscription.id} className="flex-1 min-w-max">
                  {service?.name || 'Subscription'}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {subscriptions.map(subscription => {
            const service = services.find(s => s.id === subscription.serviceId);
            return (
              <TabsContent key={subscription.id} value={subscription.id}>
                <CustomerCredentials subscription={subscription} service={service} />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardCredentials;
