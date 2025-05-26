
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Order } from "@/lib/types";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from Supabase first
        const { data: supabaseOrders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching orders from Supabase:', error);
          // Fall back to localStorage if there's an error
          loadOrdersFromLocalStorage();
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          // Process orders to ensure all products have a name property
          const processedOrders = processOrders(supabaseOrders);
          setOrders(processedOrders);
          
          // Filter orders by status
          const pending = processedOrders.filter(order => order.status === 'pending');
          const completed = processedOrders.filter(order => order.status === 'completed');
          
          setPendingOrders(pending);
          setCompletedOrders(completed);
        } else {
          // If no orders in Supabase, fall back to localStorage
          loadOrdersFromLocalStorage();
        }

        // Also fetch wholesale orders
        const { data: wholesaleOrders, error: wholesaleError } = await supabase
          .from('wholesale_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!wholesaleError && wholesaleOrders) {
          // Convert wholesale orders to the Order type
          const formattedWholesaleOrders: Order[] = wholesaleOrders.map(order => {
            // Create an object with the correct properties
            return {
              id: order.id,
              userId: order.wholesaler_id || '',
              customerId: order.customer_id,
              serviceId: order.service_id,
              serviceName: order.service_id, // We'll try to get a better name below
              quantity: order.quantity || 1,
              totalPrice: order.total_price,
              status: order.status,
              createdAt: order.created_at,
              credentials: {}, // Initialize empty credentials
              customerName: order.customer_name || 'Unknown Customer',
              total: order.total_price || 0,
              products: []
            };
          });
          
          // Combine with regular orders
          const allOrders = [...processOrders(supabaseOrders || []), ...formattedWholesaleOrders];
          const allPending = allOrders.filter(order => order.status === 'pending');
          const allCompleted = allOrders.filter(order => order.status === 'completed');
          
          setOrders(allOrders);
          setPendingOrders(allPending);
          setCompletedOrders(allCompleted);
        }
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        // Fall back to localStorage
        loadOrdersFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadOrdersFromLocalStorage = () => {
      // Fetch orders from localStorage
      const storedOrders = localStorage.getItem('orders');
      const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Process orders to ensure all products have a name property
      const processedOrders = processOrders(parsedOrders);
      
      setOrders(processedOrders);
      
      // Filter orders by status
      const pending = processedOrders.filter(order => order.status === 'pending');
      const completed = processedOrders.filter(order => order.status === 'completed');
      
      setPendingOrders(pending);
      setCompletedOrders(completed);
    };
    
    fetchOrders();

    // Set up realtime subscription for orders
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => {
        fetchOrders();
      })
      .subscribe();

    const wholesaleOrdersChannel = supabase
      .channel('wholesale-orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wholesale_orders'
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(wholesaleOrdersChannel);
    };
  }, []);

  const resolveOrder = async (order: Order) => {
    try {
      // First check if there's an available credential
      const { data: availableCredential, error: credentialError } = await supabase
        .from('credential_stock')
        .select('*')
        .eq('service_id', order.serviceId || order.products?.[0]?.productId)
        .eq('status', 'available')
        .limit(1)
        .single();
        
      if (credentialError) {
        console.error('Error fetching available credential:', credentialError);
        toast.error("No credentials available in stock");
        return;
      }
      
      if (!availableCredential) {
        toast.error("No credentials available for this service");
        return;
      }
      
      // Update the credential status
      const { error: updateCredentialError } = await supabase
        .from('credential_stock')
        .update({
          status: 'assigned',
          user_id: order.userId,
          order_id: order.id
        })
        .eq('id', availableCredential.id);
        
      if (updateCredentialError) {
        console.error('Error updating credential status:', updateCredentialError);
        toast.error("Failed to assign credential");
        return;
      }
      
      // Update the order status
      const table = order.customerId ? 'wholesale_orders' : 'orders';
      const updateData = {
        status: 'completed',
        credentials: availableCredential.credentials,
        completed_at: new Date().toISOString()
      };
      
      const { error: updateOrderError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', order.id);
        
      if (updateOrderError) {
        console.error('Error updating order status:', updateOrderError);
        toast.error("Failed to update order status");
        return;
      }
      
      // Update subscription if exists
      if (order.customerId) {
        // This is a wholesale order, check for wholesale subscription
        const { data: subscription, error: subscriptionError } = await supabase
          .from('wholesale_subscriptions')
          .select('*')
          .eq('customer_id', order.customerId)
          .eq('service_id', order.serviceId)
          .single();
          
        if (!subscriptionError && subscription) {
          const { error: updateSubError } = await supabase
            .from('wholesale_subscriptions')
            .update({
              status: 'active',
              credentials: availableCredential.credentials
            })
            .eq('id', subscription.id);
            
          if (updateSubError) {
            console.error('Error updating wholesale subscription:', updateSubError);
          }
        }
      } else {
        // Regular order, check for regular subscription
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', order.userId)
          .eq('service_id', order.serviceId || order.products?.[0]?.productId)
          .single();
          
        if (!subscriptionError && subscription) {
          const { error: updateSubError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              credentials: availableCredential.credentials,
              credential_stock_id: availableCredential.id
            })
            .eq('id', subscription.id);
            
          if (updateSubError) {
            console.error('Error updating subscription:', updateSubError);
          }
        }
      }
      
      // Update stock issue if exists
      const { error: updateStockIssueError } = await supabase
        .from('stock_issue_logs')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          notes: `Resolved with credential ID: ${availableCredential.id}`
        })
        .eq('order_id', order.id);
        
      if (updateStockIssueError) {
        console.error('Error updating stock issue:', updateStockIssueError);
      }
      
      toast.success("Order successfully resolved");
      
      // Refresh order lists
      const updatedOrders = orders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'completed', credentials: availableCredential.credentials as any } 
          : o
      );
      
      setOrders(updatedOrders);
      setPendingOrders(updatedOrders.filter(o => o.status === 'pending'));
      setCompletedOrders(updatedOrders.filter(o => o.status === 'completed'));
      
    } catch (error) {
      console.error('Error resolving order:', error);
      toast.error("Failed to resolve order");
    }
  };

  const displayOrders = activeTab === "pending" 
    ? pendingOrders 
    : activeTab === "completed" 
      ? completedOrders 
      : orders;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            A list of all orders placed by customers.
          </CardDescription>
        </div>
        {pendingOrders.length > 0 && (
          <Badge variant="destructive" className="flex gap-1">
            <Clock className="h-3 w-3" />
            {pendingOrders.length} Pending
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingOrders.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : displayOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{order.customerName || order.customerId || order.userId}</TableCell>
                      <TableCell>
                        {order.products && Array.isArray(order.products) ? (
                          order.products.map((product, index) => (
                            <div key={index}>
                              {product.name || `Product ${product.productId}`}: {product.quantity} x ${product.price}
                            </div>
                          ))
                        ) : (
                          <div>{order.serviceName || 'Unknown Product'}: {order.quantity || 1} x ${order.totalPrice}</div>
                        )}
                      </TableCell>
                      <TableCell>${order.total?.toFixed(2) || order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' && <Clock className="h-3 w-3" />}
                          {order.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.createdAt ? format(new Date(order.createdAt), 'PPP') : 'Unknown date'}
                      </TableCell>
                      <TableCell>
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => resolveOrder(order)}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 text-xs text-muted-foreground flex justify-between">
        <span>Total Orders: {orders.length}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Pending: {pendingOrders.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Completed: {completedOrders.length}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export const processOrders = (orders: any[]) => {
  if (!orders || !Array.isArray(orders)) return [];
  
  return orders.map(order => {
    // Ensure all products have a name property
    if (order.products && Array.isArray(order.products)) {
      order.products = order.products.map((product: any) => {
        if (!product) return { name: 'Unknown', quantity: 1, price: 0 };
        
        if (!product.name) {
          // Add a name property if it doesn't exist
          return {
            ...product,
            name: `Product ${product.productId || 'Unknown'}`
          };
        }
        return product;
      });
    }
    
    // Handle case where products is not defined
    if (!order.products) {
      order.products = [];
    }
    
    return order;
  });
};

export { AdminOrders };
