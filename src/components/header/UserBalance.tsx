
import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

const UserBalance = () => {
  const { user, isAuthenticated } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalanceUpdated, setShowBalanceUpdated] = useState(false);
  const [prevBalance, setPrevBalance] = useState(0);
  const navigate = useNavigate();

  const fetchUserBalance = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Fetching balance for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log('User balance data:', data);
        const safeBalance = Math.max(0, data.balance || 0);
        
        if (userBalance !== 0 && safeBalance !== userBalance) {
          setPrevBalance(userBalance);
          setShowBalanceUpdated(true);
          
          if (safeBalance < 10) {
            toast.warning('Your balance is low', {
              description: 'Please add funds to continue making purchases.'
            });
          }
          
          setTimeout(() => {
            setShowBalanceUpdated(false);
          }, 3000);
        }
        
        setUserBalance(safeBalance);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only run effects if authenticated
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    
    fetchUserBalance();
    
    // Setup realtime subscription only if authenticated
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log('Profile updated:', payload);
        if (payload.new && typeof payload.new.balance === 'number') {
          const newBalance = Math.max(0, payload.new.balance);
          
          if (userBalance !== 0 && newBalance !== userBalance) {
            setPrevBalance(userBalance);
            setShowBalanceUpdated(true);
            
            if (newBalance < 10) {
              toast.warning('Your balance is low', {
                description: 'Please add funds to your account'
              });
            }
            
            setTimeout(() => {
              setShowBalanceUpdated(false);
            }, 3000);
          }
          
          setUserBalance(newBalance);
        }
      })
      .subscribe();
      
    const intervalId = setInterval(() => {
      fetchUserBalance();
    }, 60000);
    
    const handlePurchaseEvent = () => {
      console.log('Purchase event detected, refreshing balance');
      fetchUserBalance();
    };
    
    const handleInsufficientFundsEvent = () => {
      console.log('Insufficient funds event detected, redirecting to payment page');
      toast.error('Insufficient balance', {
        description: 'Please add funds to your account'
      });
      navigate('/payment');
    };
    
    window.addEventListener('purchase-completed', handlePurchaseEvent);
    window.addEventListener('insufficient-funds', handleInsufficientFundsEvent);
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(profilesChannel);
      window.removeEventListener('purchase-completed', handlePurchaseEvent);
      window.removeEventListener('insufficient-funds', handleInsufficientFundsEvent);
    };
  }, [user, isAuthenticated, navigate, userBalance]);

  const handleClick = () => {
    navigate('/payment');
  };

  // Only render if user is authenticated and loading is complete
  if (!isAuthenticated || isLoading) {
    return null;
  }

  const balanceChange = userBalance - prevBalance;
  const isPositiveChange = balanceChange > 0;

  return (
    <div className="relative flex items-center mr-2">
      {showBalanceUpdated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`absolute -bottom-10 right-0 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
            isPositiveChange 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          Balance {isPositiveChange ? 'increased' : 'decreased'} by ${Math.abs(balanceChange).toFixed(2)}
        </motion.div>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-sm flex items-center gap-1 relative"
        onClick={handleClick}
      >
        <CreditCard className="h-4 w-4" />
        <span>${userBalance.toFixed(2)}</span>
      </Button>
    </div>
  );
};

export default UserBalance;
