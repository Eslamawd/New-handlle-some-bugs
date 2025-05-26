
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  service: Service;
  quantity: number;
  duration?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (service: Service, quantity?: number, duration?: number) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  updateDuration: (serviceId: string, duration: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        setUserId(session.session.user.id);
      } else {
        setUserId(null);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load cart from Supabase if user is authenticated, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId);
            
          if (error) {
            console.error('Error loading cart from Supabase:', error);
            loadFromLocalStorage();
            return;
          }
          
          if (data && data.length > 0) {
            // Convert Supabase cart items to our CartItem format
            // We need to fetch the full service details for each item
            const storedServices = localStorage.getItem('services');
            const services = storedServices ? JSON.parse(storedServices) : [];
            
            const convertedItems = data.map((item) => {
              const service = services.find((s: Service) => s.id === item.service_id) || {
                id: item.service_id,
                name: item.service_name,
                price: item.price,
                type: 'one-time',
                wholesalePrice: 0
              };
              
              return {
                id: item.service_id,
                name: item.service_name,
                price: item.price,
                service: service,
                quantity: item.quantity
              };
            });
            
            setCartItems(convertedItems);
          } else {
            // If no items in Supabase, check localStorage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error('Error in loadCart:', error);
          loadFromLocalStorage();
        }
      } else {
        // Not authenticated, load from localStorage
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error('Failed to parse stored cart:', error);
        }
      }
    };
    
    loadCart();
  }, [userId]);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total
    const newTotal = cartItems.reduce((sum, item) => {
      const itemPrice = item.price;
      const quantity = item.quantity || 1;
      const duration = item.duration || 1;
      
      if (item.service.type === 'subscription') {
        return sum + (itemPrice * duration * quantity);
      } else {
        return sum + (itemPrice * quantity);
      }
    }, 0);
    
    setTotal(newTotal);
    
    // Calculate item count
    const newItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    setItemCount(newItemCount);
  }, [cartItems]);

  const syncWithSupabase = async (updatedItems: CartItem[]) => {
    if (!userId) return;
    
    try {
      // First, delete all existing cart items for this user
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Error deleting cart items:', deleteError);
        return;
      }
      
      // Then insert all current cart items
      if (updatedItems.length > 0) {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(
            updatedItems.map((item) => ({
              user_id: userId,
              service_id: item.service.id,
              service_name: item.service.name,
              quantity: item.quantity,
              price: item.price,
              added_at: new Date().toISOString()
            }))
          );
          
        if (insertError) {
          console.error('Error inserting cart items:', insertError);
        }
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  };

  const addItem = (service: Service, quantity: number = 1, duration: number = 1) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(
        (item) => item.service.id === service.id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        // Update existing item
        updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
        
        toast.success('Added to cart', {
          description: `${service.name} quantity updated in cart`
        });
      } else {
        // Add new item
        updatedItems = [...prevItems, { 
          id: service.id,
          name: service.name,
          price: service.price,
          service, 
          quantity, 
          duration 
        }];
        
        toast.success('Added to cart', {
          description: `${service.name} added to your cart`
        });
      }
      
      // Sync with Supabase
      syncWithSupabase(updatedItems);
      
      return updatedItems;
    });
  };

  const removeItem = (serviceId: string) => {
    setCartItems((prevItems) => {
      const serviceToRemove = prevItems.find(item => item.service.id === serviceId);
      if (serviceToRemove) {
        toast.info('Removed from cart', {
          description: `${serviceToRemove.service.name} removed from your cart`
        });
      }
      
      const updatedItems = prevItems.filter((item) => item.service.id !== serviceId);
      
      // Sync with Supabase
      syncWithSupabase(updatedItems);
      
      return updatedItems;
    });
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(serviceId);
      return;
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, quantity } : item
      );
      
      // Sync with Supabase
      syncWithSupabase(updatedItems);
      
      return updatedItems;
    });
  };

  const updateDuration = (serviceId: string, duration: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, duration } : item
      );
      
      // Sync with Supabase
      syncWithSupabase(updatedItems);
      
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    
    // Sync with Supabase
    syncWithSupabase([]);
    
    toast.info('Cart cleared', {
      description: 'All items have been removed from your cart'
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        updateDuration,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
