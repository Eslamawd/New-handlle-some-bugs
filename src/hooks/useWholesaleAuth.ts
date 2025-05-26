
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export const useWholesaleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWholesaler, setCurrentWholesaler] = useState<string>('');
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const validateSession = () => {
    if (localStorage.getItem('wholesaleAuthenticated') === 'true') {
      const expiration = localStorage.getItem('wholesaleAuthExpires');
      if (expiration && parseInt(expiration) < Date.now()) {
        localStorage.removeItem('wholesaleAuthenticated');
        localStorage.removeItem('wholesaleAuthExpires');
        localStorage.removeItem('wholesalerId');
        localStorage.removeItem('wholesaleDeviceId');
        return false;
      }
      
      return true;
    }
    
    if (sessionStorage.getItem('wholesaleAuthenticated') === 'true') {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Auth state changed: INITIAL_SESSION');
        
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          if (validateSession()) {
            const savedWholesalerId = localStorage.getItem('wholesalerId') || sessionStorage.getItem('wholesalerId');
            if (savedWholesalerId) {
              setIsAuthenticated(true);
              setCurrentWholesaler(savedWholesalerId);
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        if (sessionData?.session) {
          console.log('Session found:', sessionData.session.user.id);
          
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          if (roleData?.role === 'wholesale') { // Changed from 'wholesaler' to 'wholesale'
            setIsAuthenticated(true);
            setCurrentWholesaler(sessionData.session.user.id);
            
            if (localStorage.getItem('rememberedWholesaleUsername')) {
              localStorage.setItem('wholesaleAuthenticated', 'true');
              localStorage.setItem('wholesalerId', sessionData.session.user.id);
              const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
              localStorage.setItem('wholesaleAuthExpires', expiration.toString());
            } else {
              sessionStorage.setItem('wholesaleAuthenticated', 'true');
              sessionStorage.setItem('wholesalerId', sessionData.session.user.id);
            }
          } else {
            if (validateSession()) {
              const savedWholesalerId = localStorage.getItem('wholesalerId') || sessionStorage.getItem('wholesalerId');
              if (savedWholesalerId) {
                setIsAuthenticated(true);
                setCurrentWholesaler(savedWholesalerId);
              }
            }
          }
        } else {
          console.log('No authenticated session, checking localStorage');
          if (validateSession()) {
            const savedWholesalerId = localStorage.getItem('wholesalerId') || sessionStorage.getItem('wholesalerId');
            if (savedWholesalerId) {
              setIsAuthenticated(true);
              setCurrentWholesaler(savedWholesalerId);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setCurrentWholesaler(session.user.id);
        
        if (localStorage.getItem('rememberedWholesaleUsername')) {
          localStorage.setItem('wholesaleAuthenticated', 'true');
          localStorage.setItem('wholesalerId', session.user.id);
          const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('wholesaleAuthExpires', expiration.toString());
        } else {
          sessionStorage.setItem('wholesaleAuthenticated', 'true');
          sessionStorage.setItem('wholesalerId', session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentWholesaler('');
        localStorage.removeItem('wholesaleAuthenticated');
        localStorage.removeItem('wholesaleAuthExpires');
        localStorage.removeItem('wholesalerId');
        localStorage.removeItem('wholesaleDeviceId');
        sessionStorage.removeItem('wholesaleAuthenticated');
        sessionStorage.removeItem('wholesalerId');
        sessionStorage.removeItem('wholesaleDeviceId');
        setIsLoggedOut(true);
      }
    });
    
    const sessionCheckInterval = setInterval(() => {
      if (!validateSession()) {
        setIsAuthenticated(false);
        setCurrentWholesaler('');
        setIsLoggedOut(true);
      }
    }, 15 * 60 * 1000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const handleLoginSuccess = (wholesalerId: string) => {
    setIsAuthenticated(true);
    setCurrentWholesaler(wholesalerId);
    setIsLoggedOut(false);
    return Promise.resolve(true);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      setIsAuthenticated(false);
      setCurrentWholesaler('');
      localStorage.removeItem('wholesaleAuthenticated');
      localStorage.removeItem('wholesaleAuthExpires');
      localStorage.removeItem('wholesalerId');
      localStorage.removeItem('wholesaleDeviceId');
      sessionStorage.removeItem('wholesaleAuthenticated');
      sessionStorage.removeItem('wholesalerId');
      sessionStorage.removeItem('wholesaleDeviceId');
      setIsLoggedOut(true);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = async (metricsData: any) => {
    if (!currentWholesaler) return;
    
    try {
      const { data: existingMetrics } = await supabase
        .from('wholesale_metrics')
        .select('id')
        .eq('wholesaler_id', currentWholesaler)
        .single();
      
      if (existingMetrics) {
        await supabase
          .from('wholesale_metrics')
          .update(metricsData)
          .eq('wholesaler_id', currentWholesaler);
      } else {
        await supabase
          .from('wholesale_metrics')
          .insert({
            ...metricsData,
            wholesaler_id: currentWholesaler
          });
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    currentWholesaler, 
    handleLoginSuccess,
    handleLogout,
    isLoggedOut,
    updateMetrics
  };
};
