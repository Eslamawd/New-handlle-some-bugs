
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTracker from '@/components/dashboard/SubscriptionTracker';
import { useEffect, useState } from 'react';
import { Service } from '@/lib/types';
import { loadServices } from '@/lib/productManager';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.log("No active session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        setUserId(data.session.user.id);
        
        // Load services for the subscription tracker
        const loadedServices = loadServices();
        setServices(loadedServices);
      } catch (err) {
        console.error("Error checking auth:", err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const handleServiceUpdate = () => {
      const updatedServices = loadServices();
      setServices(updatedServices);
    };
    
    window.addEventListener('service-updated', handleServiceUpdate);
    window.addEventListener('service-added', handleServiceUpdate);
    window.addEventListener('service-deleted', handleServiceUpdate);
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdate);
      window.removeEventListener('service-added', handleServiceUpdate);
      window.removeEventListener('service-deleted', handleServiceUpdate);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <Tabs defaultValue="subscriptions">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscriptions" className="space-y-8 mt-6">
          <SubscriptionTracker services={services} />
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
              <p className="text-muted-foreground text-sm">
                Your payment history will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="support" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Support Tickets</h2>
              <p className="text-muted-foreground text-sm">
                Your support tickets will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
