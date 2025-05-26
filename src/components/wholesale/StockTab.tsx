import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import StockSubscriptions from '@/components/StockSubscriptions';
import { Subscription } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isSubscriptionEndingSoon } from './stock/utils';
import { supabase } from '@/integrations/supabase/client';
import WholesaleSubscriptionManager from './stock/WholesaleSubscriptionManager';

interface StockTabProps {
  subscriptions: Subscription[];
}

const StockTab: React.FC<StockTabProps> = ({ subscriptions }) => {
  const navigate = useNavigate();
  const [renewedSubscriptions, setRenewedSubscriptions] = useState<string[]>([]);
  const [safeSubscriptions, setSafeSubscriptions] = useState<Subscription[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('subscription-manager');
  const [userBalance, setUserBalance] = useState(0);

  const wholesalerId = localStorage.getItem('wholesalerId') || '';

  const endingSoonCount = subscriptions.filter(sub => 
    isSubscriptionEndingSoon(sub, 5)
  ).length;

  useEffect(() => {
    try {
      if (!Array.isArray(subscriptions)) {
        console.error('Subscriptions is not an array:', subscriptions);
        setSafeSubscriptions([]);
        return;
      }
      
      const validSubs = subscriptions.filter(sub => {
        return (
          sub && 
          typeof sub === 'object' &&
          sub.id && 
          sub.userId && 
          sub.serviceId && 
          sub.startDate && 
          sub.endDate
        );
      });
      
      setSafeSubscriptions(validSubs);
      console.log(`Loaded ${validSubs.length} valid subscriptions in StockTab`);
    } catch (error) {
      console.error('Error processing subscriptions:', error);
      setSafeSubscriptions([]);
    }
  }, [subscriptions]);

  const fetchUserBalance = useCallback(async () => {
    try {
      if (!wholesalerId) return 0;

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || wholesalerId;
      
      if (!userId) {
        console.error('No user ID available to fetch balance');
        return 0;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user balance:', error);
        const userBalanceStr = localStorage.getItem(`userBalance_${wholesalerId}`);
        return userBalanceStr ? parseFloat(userBalanceStr) : 0;
      }
      
      if (data) {
        setUserBalance(data.balance || 0);
        localStorage.setItem(`userBalance_${wholesalerId}`, data.balance.toString());
        return data.balance;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      const userBalanceStr = localStorage.getItem(`userBalance_${wholesalerId}`);
      return userBalanceStr ? parseFloat(userBalanceStr) : 0;
    }
  }, [wholesalerId]);

  useEffect(() => {
    fetchUserBalance();
    
    const intervalId = setInterval(() => {
      fetchUserBalance();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchUserBalance]);

  const handleRenewal = useCallback(async (subscription: Subscription) => {
    if (isProcessing) {
      toast.info("Please wait while processing the current request");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      if (!subscription || !subscription.id || !subscription.serviceId) {
        toast.error("Invalid subscription data");
        setIsProcessing(false);
        return;
      }
      
      const product = products.find(p => p.id === subscription.serviceId);
      
      if (!product) {
        toast.error("Product not found");
        setIsProcessing(false);
        return;
      }
      
      const renewalPrice = product.wholesalePrice || 0;
      
      const currentBalance = await fetchUserBalance();
      
      if (currentBalance < renewalPrice) {
        toast.error("Insufficient balance", {
          description: "You don't have enough funds to renew this subscription"
        });
        navigate("/payment");
        setIsProcessing(false);
        return;
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || wholesalerId;
      
      if (!userId) {
        toast.error("Authentication error");
        setIsProcessing(false);
        return;
      }
      
      const newBalance = currentBalance - renewalPrice;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user balance:', updateError);
        toast.error("Failed to update balance");
        setIsProcessing(false);
        return;
      }
      
      setUserBalance(newBalance);
      localStorage.setItem(`userBalance_${wholesalerId}`, newBalance.toString());
      
      setRenewedSubscriptions(prev => [...prev, subscription.id]);
      
      toast.success(`Subscription renewed successfully!`, {
        description: `$${renewalPrice.toFixed(2)} has been deducted from your balance.`
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error('Failed to renew subscription');
      setIsProcessing(false);
    }
  }, [fetchUserBalance, wholesalerId, navigate, isProcessing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Your Balance:</span>
          <span className="text-xl font-bold">${userBalance.toFixed(2)}</span>
        </div>
        {userBalance < 50 && (
          <div className="mt-2">
            <Button 
              size="sm" 
              onClick={() => navigate("/payment")}
              className="w-full"
            >
              Add Funds
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="subscription-manager">Subscription Manager</TabsTrigger>
          <TabsTrigger value="legacy-view">Legacy View</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription-manager">
          <WholesaleSubscriptionManager wholesalerId={wholesalerId} />
        </TabsContent>

        <TabsContent value="legacy-view">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Subscriptions</TabsTrigger>
              <TabsTrigger value="ending-soon" className="relative">
                Ending Soon
                {endingSoonCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {endingSoonCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {safeSubscriptions.length > 0 ? (
                <StockSubscriptions 
                  subscriptions={safeSubscriptions}
                  allowRenewal={true}
                  onRenew={handleRenewal}
                  renewedSubscriptions={renewedSubscriptions}
                  category="all"
                />
              ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No active subscriptions found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ending-soon">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <h3 className="font-medium text-amber-800 mb-1">Ending Soon</h3>
                <p className="text-sm text-amber-700">
                  These subscriptions will expire within the next 5 days. Consider renewing these subscriptions or notifying your customers.
                </p>
              </div>

              {endingSoonCount > 0 ? (
                <StockSubscriptions 
                  subscriptions={safeSubscriptions}
                  allowRenewal={true}
                  onRenew={handleRenewal}
                  renewedSubscriptions={renewedSubscriptions}
                  category="ending-soon"
                />
              ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No subscriptions ending soon</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StockTab;
