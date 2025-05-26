
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extend the User type to include the properties we're using
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateUser: (userData: Partial<User> & { company?: string; notes?: string; phone?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        
        if (newSession?.user) {
          fetchUserProfile(newSession.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          fetchUserProfile(currentSession.user);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error in checkSession:', err);
        setIsLoading(false);
      }
    };

    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log("Fetching profile for user:", supabaseUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
        return;
      }

      console.log("Profile data:", profile);
      const userData: User = {
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.user_metadata?.name || '',
        email: supabaseUser.email || '',
        role: 'customer',
        balance: profile?.balance || 0,
        createdAt: profile?.created_at || supabaseUser.created_at || new Date().toISOString()
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('currentUserId', userData.id);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Invalid email or password');
        return false;
      }

      // Auth state change listener will handle updating the state
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserId');
      
      // Auth state change listener will handle updating the state
      window.dispatchEvent(new Event('globalLogout'));
      window.dispatchEvent(new Event('authStateChanged'));
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'An error occurred during logout');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (signUpError) {
        toast.error(signUpError.message || 'Failed to create account');
        console.error('Registration error:', signUpError);
        return false;
      }

      toast.success('Account created successfully!');
      
      if (data.user && !data.user.confirmed_at) {
        toast.info('Please check your email to confirm your account');
      }
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User> & { company?: string; notes?: string; phone?: string }) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          company: userData.company,
          notes: userData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating user profile:', error);
        return;
      }
      
      const updatedUser = { 
        ...user, 
        name: userData.name || user.name,
        email: userData.email || user.email,
        phone: userData.phone,
        role: userData.role || user.role,
        balance: userData.balance !== undefined ? userData.balance : user.balance,
        createdAt: userData.createdAt || user.createdAt
      };
      
      setUser(updatedUser);
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error in updateUser:', error);
      toast.error('An error occurred while updating your profile');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      register,
      updateUser
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
