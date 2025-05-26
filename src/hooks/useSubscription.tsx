
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subscription, Service } from '@/lib/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => void;
  hasActiveSubscription: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First try to fetch from Supabase if available
      const { data: supabaseSubscriptions, error: supabaseError } = await supabase
        .from('subscriptions')
        .select('*, credential_stock:credential_stock_id(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1);
      
      if (supabaseError) {
        console.error('Supabase fetch error:', supabaseError);
        // Fall back to localStorage if Supabase query fails
        fallbackToLocalStorage();
        return;
      }
      
      if (supabaseSubscriptions && supabaseSubscriptions.length > 0) {
        // Map the Supabase subscription to our Subscription type
        const subData = supabaseSubscriptions[0];
        
        // Parse the credentials JSON if it exists, or default to null/empty object
        let credentialsObj = null;
        
        // First check if we have linked credential stock
        if (subData.credential_stock && subData.credential_stock.credentials) {
          try {
            // Handle both string and object formats that might come from Supabase
            if (typeof subData.credential_stock.credentials === 'string') {
              credentialsObj = JSON.parse(subData.credential_stock.credentials);
            } else {
              // Already an object
              credentialsObj = subData.credential_stock.credentials;
            }
          } catch (e) {
            console.error('Error parsing credential stock credentials:', e);
            credentialsObj = {};
          }
        }
        // If no credential stock, try the legacy credentials field
        else if (subData.credentials) {
          try {
            // Handle both string and object formats that might come from Supabase
            if (typeof subData.credentials === 'string') {
              credentialsObj = JSON.parse(subData.credentials);
            } else {
              // Already an object
              credentialsObj = subData.credentials;
            }
          } catch (e) {
            console.error('Error parsing credentials string:', e);
            credentialsObj = {};
          }
        }
        
        const latestSubscription: Subscription = {
          id: subData.id,
          userId: subData.user_id,
          serviceId: subData.service_id,
          startDate: subData.start_date,
          endDate: subData.end_date,
          status: subData.status as 'active' | 'expired' | 'cancelled',
          durationMonths: subData.duration_months,
          credentials: credentialsObj,
          credentialStockId: subData.credential_stock_id
        };
        
        setSubscription(latestSubscription);
        setHasActiveSubscription(true);
        setIsLoading(false);
        return;
      }
      
      // If no data in Supabase, fall back to localStorage
      fallbackToLocalStorage();
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      fallbackToLocalStorage();
    }
  };
  
  const fallbackToLocalStorage = () => {
    try {
      // Fallback to localStorage
      const storedSubscriptions = localStorage.getItem('subscriptions');
      let userSubscriptions: Subscription[] = [];
      
      if (storedSubscriptions) {
        const allSubscriptions = JSON.parse(storedSubscriptions);
        userSubscriptions = allSubscriptions.filter(
          (sub: Subscription) => sub.userId === user?.id && sub.status === 'active'
        );
      }
      
      // Get the most recent active subscription
      const latestSubscription = userSubscriptions.length > 0 
        ? userSubscriptions.sort((a, b) => 
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          )[0] 
        : null;
      
      setSubscription(latestSubscription);
      setHasActiveSubscription(!!latestSubscription);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch subscription from localStorage:', err);
      setError('Failed to load subscription data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const refreshSubscription = () => {
    fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        isLoading, 
        error, 
        refreshSubscription,
        hasActiveSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
