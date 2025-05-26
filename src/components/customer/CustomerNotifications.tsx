
import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, UserCheck, CreditCard, KeyRound, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getCustomerNotifications, 
  markCustomerNotificationAsRead, 
  markAllCustomerNotificationsAsRead 
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Interface for database notifications
interface CustomerNotification {
  id: string;
  title?: string;
  message?: string;
  created_at: string;
  is_read: boolean;
  type: string;
  user_id: string;
  service_id?: string;
  service_name?: string;
  subscription_id?: string;
  customer_id?: string;
  customer_name?: string;
  payment_method?: string;
  amount?: number;
}

interface CustomerNotificationsProps {
  userId: string;
}

const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load notifications when component mounts or when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up realtime subscription for new notifications
      const channel = supabase
        .channel('public:admin_notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          setNotifications(current => [payload.new as CustomerNotification, ...current]);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (!userId) {
        // Fallback to mock data if no userId
        const mockData = getCustomerNotifications(userId);
        // Transform mock data to match our interface
        const transformedMockData: CustomerNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.read || false,
          user_id: userId
        }));
        setNotifications(transformedMockData);
        setLoading(false);
        return;
      }
      
      // Get notifications from admin_notifications table that are for this user
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error('Error fetching customer notifications:', error);
        // Fallback to mock data
        const mockData = getCustomerNotifications(userId);
        // Transform mock data to match our interface
        const transformedMockData: CustomerNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.read || false,
          user_id: userId
        }));
        setNotifications(transformedMockData);
      } else if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // Fallback to mock data if no real notifications found
        const mockData = getCustomerNotifications(userId);
        // Transform mock data to match our interface
        const transformedMockData: CustomerNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.read || false,
          user_id: userId
        }));
        setNotifications(transformedMockData);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      // Fallback to mock data
      const mockData = getCustomerNotifications(userId);
      // Transform mock data to match our interface
      const transformedMockData: CustomerNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.read || false,
        user_id: userId
      }));
      setNotifications(transformedMockData);
    } finally {
      setLoading(false);
    }
  };

  const handleReadNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error marking notification as read:', error);
        // Fallback to local update
        markCustomerNotificationAsRead(id);
        const mockData = getCustomerNotifications(userId);
        // Transform mock data to match our interface
        const transformedMockData: CustomerNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.read || false,
          user_id: userId
        }));
        setNotifications(transformedMockData);
        return;
      }
      
      setNotifications(current => 
        current.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error in handleReadNotification:', error);
      // Fallback to local update
      markCustomerNotificationAsRead(id);
      const mockData = getCustomerNotifications(userId);
      // Transform mock data to match our interface
      const transformedMockData: CustomerNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.read || false,
        user_id: userId
      }));
      setNotifications(transformedMockData);
    }
  };

  const handleReadAll = async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.is_read)
        .map(notification => notification.id);
        
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Fallback to local update
        markAllCustomerNotificationsAsRead(userId);
        const mockData = getCustomerNotifications(userId);
        // Transform mock data to match our interface
        const transformedMockData: CustomerNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.read || false,
          user_id: userId
        }));
        setNotifications(transformedMockData);
        return;
      }
      
      setNotifications(current => 
        current.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error in handleReadAll:', error);
      // Fallback to local update
      markAllCustomerNotificationsAsRead(userId);
      const mockData = getCustomerNotifications(userId);
      // Transform mock data to match our interface
      const transformedMockData: CustomerNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.read || false,
        user_id: userId
      }));
      setNotifications(transformedMockData);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_fixed':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'payment_resolved':
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case 'password_reset':
        return <KeyRound className="h-4 w-4 text-purple-500" />;
      case 'order_completed':
        return <Package className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={handleReadAll}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-default ${notification.is_read ? '' : 'bg-muted/40'}`}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    {notification.title && <p className="text-sm font-medium">{notification.title}</p>}
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleReadNotification(notification.id)}
                    >
                      <CheckCheck className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerNotifications;
