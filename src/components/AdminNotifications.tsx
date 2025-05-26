
import React, { useState, useEffect } from 'react';
import { Bell, Check, UserCog, CreditCard, KeyRound, Calendar, DollarSign } from 'lucide-react';
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
  getAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { AdminNotification as AdminNotificationType } from '@/lib/types';

// Interface for notifications as they exist in the database
interface AdminNotification {
  id: string;
  title?: string;
  message?: string;
  created_at: string;
  is_read: boolean;
  type: string;
  customer_name?: string;
  service_name?: string;
  amount?: number;
  payment_method?: string;
  link_to?: string;
  user_id?: string;
  customer_id?: string;
  service_id?: string;
  subscription_id?: string;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('public:admin_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'admin_notifications' 
      }, (payload) => {
        setNotifications(current => [payload.new as AdminNotification, ...current]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Get notifications from admin_notifications table
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to mock data
        const mockData = getAdminNotifications();
        // Transform mock data to match our interface
        const transformedMockData: AdminNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.isRead || false,
          customer_name: item.customerName,
          service_name: item.serviceName,
          payment_method: item.paymentMethod,
          link_to: item.linkTo,
        }));
        setNotifications(transformedMockData);
      } else if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      // Fallback to mock data
      const mockData = getAdminNotifications();
      // Transform mock data to match our interface
      const transformedMockData: AdminNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.isRead || false,
        customer_name: item.customerName,
        service_name: item.serviceName,
        payment_method: item.paymentMethod,
        link_to: item.linkTo,
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
        .eq('id', id);
        
      if (error) {
        console.error('Error marking notification as read:', error);
        // Fallback to local update
        markNotificationAsRead(id);
        const mockData = getAdminNotifications();
        // Transform mock data to match our interface
        const transformedMockData: AdminNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.isRead || false,
          customer_name: item.customerName,
          service_name: item.serviceName,
          payment_method: item.paymentMethod,
          link_to: item.linkTo,
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
      markNotificationAsRead(id);
      const mockData = getAdminNotifications();
      // Transform mock data to match our interface
      const transformedMockData: AdminNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.isRead || false,
        customer_name: item.customerName,
        service_name: item.serviceName,
        payment_method: item.paymentMethod,
        link_to: item.linkTo,
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
        .in('id', unreadIds);
        
      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Fallback to local update
        markAllNotificationsAsRead();
        const mockData = getAdminNotifications();
        // Transform mock data to match our interface
        const transformedMockData: AdminNotification[] = mockData.map(item => ({
          ...item,
          created_at: item.createdAt,
          is_read: item.isRead || false,
          customer_name: item.customerName,
          service_name: item.serviceName,
          payment_method: item.paymentMethod,
          link_to: item.linkTo,
        }));
        setNotifications(transformedMockData);
        return;
      }
      
      setNotifications(current => 
        current.map(notification => ({ ...notification, is_read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error in handleReadAll:', error);
      // Fallback to local update
      markAllNotificationsAsRead();
      const mockData = getAdminNotifications();
      // Transform mock data to match our interface
      const transformedMockData: AdminNotification[] = mockData.map(item => ({
        ...item,
        created_at: item.createdAt,
        is_read: item.isRead || false,
        customer_name: item.customerName,
        service_name: item.serviceName,
        payment_method: item.paymentMethod,
        link_to: item.linkTo,
      }));
      setNotifications(transformedMockData);
    }
  };

  const handleNavigate = (notification: AdminNotification) => {
    // If there's a specific link destination, use that
    if (notification.link_to) {
      navigate(notification.link_to);
    } else {
      // Otherwise use default navigation based on type
      if (notification.type === 'payment_request') {
        navigate('/admin/payments');
      } else if (notification.type === 'new_order') {
        navigate('/admin/orders');
      } else {
        navigate('/admin/issues');
      }
    }
    
    // Mark as read when clicked
    handleReadNotification(notification.id);
    setOpen(false);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_fix':
        return <UserCog className="h-4 w-4 text-blue-500" />;
      case 'payment_issue':
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case 'password_reset':
        return <KeyRound className="h-4 w-4 text-purple-500" />;
      case 'new_order':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'payment_request':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  // Get formatted message based on notification type and data
  const getNotificationMessage = (notification: AdminNotification) => {
    // If we have a message from the database, use that
    if (notification.message) {
      return notification.message;
    }
    
    // Otherwise, fallback to generated message
    const { type, customer_name, service_name, amount, payment_method } = notification;
    const customerName = customer_name || 'A customer';
    
    switch (type) {
      case 'profile_fix':
        return `${customerName} requested a profile fix for ${service_name || 'a service'}`;
      case 'payment_issue':
        return `${customerName} reported a payment issue for ${service_name || 'a service'}`;
      case 'password_reset':
        return `${customerName} requested password reset for ${service_name || 'their account'}`;
      case 'new_order':
        return `${customerName} purchased ${service_name || 'a new service'}`;
      case 'payment_request':
        return `${customerName} sent ${amount?.toFixed(2) || '0.00'} via ${payment_method || 'unknown method'}`;
      default:
        return 'New notification';
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
              <Check className="h-3 w-3 mr-1" />
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
                className={`flex flex-col items-start p-3 cursor-pointer ${notification.is_read ? '' : 'bg-muted/40'}`}
                onClick={() => handleNavigate(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    {notification.title && <p className="text-sm font-medium">{notification.title}</p>}
                    <p className="text-sm">{getNotificationMessage(notification)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadNotification(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
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

export default AdminNotifications;
