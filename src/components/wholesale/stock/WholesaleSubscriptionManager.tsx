
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Clock, AlertTriangle, AlertCircle, CalendarClock, Search, RefreshCw, Users, User } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { products, customers } from '@/lib/data';
import { toast } from 'sonner';

interface WholesaleSubscriptionManagerProps {
  wholesalerId?: string;
}

const WholesaleSubscriptionManager: React.FC<WholesaleSubscriptionManagerProps> = ({ 
  wholesalerId = '' 
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('expiring-soon');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [groupByCustomer, setGroupByCustomer] = useState(true);
  
  // Get the wholesaler ID from props or localStorage
  const effectiveWholesalerId = wholesalerId || localStorage.getItem('wholesalerId') || '';

  // Fetch all wholesale subscriptions for the current wholesaler
  useEffect(() => {
    if (!effectiveWholesalerId) {
      setIsLoading(false);
      return;
    }
    
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // First, get all customers of this wholesaler
        const { data: wholesaleCustomers, error: customersError } = await supabase
          .from('wholesale_customers')
          .select('id')
          .eq('wholesaler_id', effectiveWholesalerId);
          
        if (customersError) {
          console.error('Error fetching wholesale customers:', customersError);
          fallbackToLocalStorage();
          return;
        }
        
        if (wholesaleCustomers && wholesaleCustomers.length > 0) {
          // Get all customer IDs
          const customerIds = wholesaleCustomers.map(c => c.id);
          
          // Fetch all subscriptions for these customers
          const { data: wholesaleSubscriptions, error } = await supabase
            .from('wholesale_subscriptions')
            .select('*')
            .in('customer_id', customerIds);
            
          if (error) {
            console.error('Error fetching wholesale subscriptions:', error);
            fallbackToLocalStorage();
            return;
          }
          
          if (wholesaleSubscriptions && wholesaleSubscriptions.length > 0) {
            console.log(`Fetched ${wholesaleSubscriptions.length} subscriptions for ${customerIds.length} customers`);
            
            const formattedSubscriptions: Subscription[] = wholesaleSubscriptions.map(sub => {
              // Process credentials if present
              let parsedCredentials = undefined;
              if (sub.credentials) {
                try {
                  // Handle both string and object formats
                  const credsData = typeof sub.credentials === 'string' 
                    ? JSON.parse(sub.credentials) 
                    : sub.credentials;
                  
                  parsedCredentials = {
                    email: credsData.email || '',
                    password: credsData.password || '',
                    username: credsData.username,
                    ...(credsData || {})
                  };
                } catch (e) {
                  console.error('Error parsing credentials:', e);
                }
              }
              
              return {
                id: sub.id,
                userId: sub.customer_id,
                serviceId: sub.service_id,
                startDate: sub.start_date,
                endDate: sub.end_date,
                status: sub.status as "active" | "expired" | "cancelled" | "pending",
                durationMonths: sub.duration_months,
                credentials: parsedCredentials,
                isPending: sub.status === 'pending' || !sub.credentials
              };
            });
            
            setSubscriptions(formattedSubscriptions);
          } else {
            console.log('No subscriptions found for these customers, trying fallback');
            fallbackToLocalStorage();
          }
        } else {
          console.log('No customers found for this wholesaler, trying fallback');
          fallbackToLocalStorage();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchSubscriptions:', error);
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      try {
        const savedSubscriptions = localStorage.getItem('wholesaleSubscriptions');
        if (savedSubscriptions) {
          const allSubs = JSON.parse(savedSubscriptions);
          // Include all subscriptions from localStorage for this wholesaler's customers
          const relevantSubs = allSubs.filter((sub: Subscription) => {
            const customer = customers.find(c => c.id === sub.userId);
            return customer?.wholesalerId === effectiveWholesalerId;
          });
          
          setSubscriptions(relevantSubs);
          console.log(`Loaded ${relevantSubs.length} subscriptions from localStorage`);
        } else {
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
    
    // Set up real-time subscription for updates
    const subscriptionsChannel = supabase
      .channel('wholesale_subs_tracker')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wholesale_subscriptions'
      }, (_payload) => {
        // Refresh subscriptions when data changes
        fetchSubscriptions();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [effectiveWholesalerId]);

  // Get service name from product data
  const getServiceName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : 'Unknown Service';
  };

  // Get customer name
  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Get subscription status and color based on remaining days
  const getSubscriptionStatus = (endDate: string) => {
    const today = new Date();
    const end = parseISO(endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) {
      return { 
        status: "Expired", 
        color: "destructive",
        daysText: "Expired", 
        bgColor: "bg-red-50", 
        textColor: "text-red-800",
        borderColor: "border-red-200",
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    if (daysLeft <= 30) {
      return { 
        status: "Expiring Soon", 
        color: "orange", 
        daysText: `${daysLeft} days left`,
        bgColor: "bg-amber-50",
        textColor: "text-amber-800",
        borderColor: "border-amber-200",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }
    
    return { 
      status: "Active", 
      color: "green", 
      daysText: `${daysLeft} days left`,
      bgColor: "bg-green-50",
      textColor: "text-green-800", 
      borderColor: "border-green-200",
      icon: <Clock className="h-4 w-4" />
    };
  };
  
  // Calculate the percentage of time elapsed in the subscription
  const calculateProgressPercentage = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const today = new Date();
    
    // If already expired, return 100%
    if (today > end) return 100;
    
    const totalDuration = differenceInDays(end, start);
    const elapsed = differenceInDays(today, start);
    
    // Calculate percentage of time elapsed
    const percentage = (elapsed / totalDuration) * 100;
    
    // Cap percentage between 0 and 100
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Filter subscriptions based on search term and selected customer
  const filteredSubscriptions = subscriptions.filter(sub => {
    const serviceName = getServiceName(sub.serviceId).toLowerCase();
    const customerName = getCustomerName(sub.userId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    // Apply customer filter if selected
    if (selectedCustomerId && sub.userId !== selectedCustomerId) {
      return false;
    }
    
    // Apply search filter
    return (
      serviceName.includes(searchLower) || 
      customerName.includes(searchLower) ||
      (sub.credentials?.email && sub.credentials.email.toLowerCase().includes(searchLower))
    );
  });

  // Sort subscriptions based on selected option
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortOption) {
      case 'expiring-soon':
        return parseISO(a.endDate).getTime() - parseISO(b.endDate).getTime();
      case 'customer':
        return getCustomerName(a.userId).localeCompare(getCustomerName(b.userId));
      case 'service':
        return getServiceName(a.serviceId).localeCompare(getServiceName(b.serviceId));
      default:
        return 0;
    }
  });

  // Group subscriptions by customer if enabled
  const groupedByCustomer = groupByCustomer 
    ? Object.entries(
        sortedSubscriptions.reduce((acc: Record<string, Subscription[]>, sub) => {
          if (!acc[sub.userId]) {
            acc[sub.userId] = [];
          }
          acc[sub.userId].push(sub);
          return acc;
        }, {})
      )
    : [];

  // Active subscriptions
  const activeSubscriptions = sortedSubscriptions.filter(
    sub => sub.status === 'active' || 
    (sub.status !== 'cancelled' && differenceInDays(parseISO(sub.endDate), new Date()) >= 0)
  );
  
  // Soon expiring subscriptions
  const soonExpiringSubscriptions = activeSubscriptions.filter(
    sub => differenceInDays(parseISO(sub.endDate), new Date()) <= 30
  );
  
  // Expired subscriptions
  const expiredSubscriptions = sortedSubscriptions.filter(
    sub => sub.status === 'expired' || 
    (sub.status !== 'cancelled' && differenceInDays(parseISO(sub.endDate), new Date()) < 0)
  );

  // Function to handle bulk renewal
  const handleBulkRenew = (subscriptionsToRenew: Subscription[]) => {
    // This would trigger a modal or navigate to a renewal page
    console.log('Renewing subscriptions:', subscriptionsToRenew);
    
    toast.success(`Preparing to renew ${subscriptionsToRenew.length} subscriptions`, {
      description: "This would open a bulk renewal interface."
    });
    
    // Dispatch an event that other components can listen for
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', {
      detail: { bulkRenew: true, subscriptions: subscriptionsToRenew }
    }));
  };

  // Handle individual renewal
  const handleRenew = (subscription: Subscription) => {
    toast.success(`Preparing to renew subscription for ${getCustomerName(subscription.userId)}`, {
      description: `${getServiceName(subscription.serviceId)}`
    });
    
    // Dispatch an event to open the purchase dialog
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', {
      detail: { 
        customerId: subscription.userId,
        customerName: getCustomerName(subscription.userId),
        subscription,
        serviceId: subscription.serviceId
      }
    }));
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Track and manage all customer subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>Track and manage all customer subscriptions</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setGroupByCustomer(!groupByCustomer)}
            >
              {groupByCustomer ? <Users className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              <span>{groupByCustomer ? "Group by Customer" : "Group by Expiry"}</span>
            </Button>
            
            {soonExpiringSubscriptions.length > 0 && (
              <Button 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => handleBulkRenew(soonExpiringSubscriptions)}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Bulk Renew ({soonExpiringSubscriptions.length})</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Active Subscriptions</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{activeSubscriptions.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium">Expiring Within 30 Days</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{soonExpiringSubscriptions.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium">Expired</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{expiredSubscriptions.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <InputWithIcon
            placeholder="Search customers or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
            icon={<Search className="h-4 w-4" />}
          />
          
          <div className="flex gap-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiring-soon">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Expiring Soon</span>
                  </div>
                </SelectItem>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Customer Name</span>
                  </div>
                </SelectItem>
                <SelectItem value="service">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Service Name</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {selectedCustomerId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCustomerId(null)}
                className="text-sm"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="relative">
              All
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                {sortedSubscriptions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="expiring-soon" className="relative">
              Expiring Soon
              {soonExpiringSubscriptions.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium rounded-full px-2 py-0.5">
                  {soonExpiringSubscriptions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired" className="relative">
              Expired
              {expiredSubscriptions.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-0.5">
                  {expiredSubscriptions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content */}
          <TabsContent value="all">
            {groupByCustomer ? (
              <div className="space-y-8">
                {groupedByCustomer.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">No subscriptions found matching your criteria.</p>
                  </div>
                ) : (
                  groupedByCustomer.map(([customerId, customerSubscriptions]) => (
                    <Card key={customerId} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {getCustomerName(customerId)}
                        </CardTitle>
                        <CardDescription>
                          {customerSubscriptions.length} subscription{customerSubscriptions.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {customerSubscriptions.map(subscription => {
                            const serviceName = getServiceName(subscription.serviceId);
                            const statusInfo = getSubscriptionStatus(subscription.endDate);
                            const progressPercent = calculateProgressPercentage(subscription.startDate, subscription.endDate);
                            
                            return (
                              <Card 
                                key={subscription.id} 
                                className={`border ${statusInfo.borderColor} overflow-hidden`}
                              >
                                <div className={`${statusInfo.bgColor} px-4 py-2 flex items-center justify-between`}>
                                  <div className="flex items-center gap-2">
                                    {statusInfo.icon}
                                    <span className={`font-medium ${statusInfo.textColor}`}>
                                      {statusInfo.status}
                                    </span>
                                  </div>
                                  <Badge 
                                    variant={
                                      statusInfo.color === "green" ? "default" : 
                                      statusInfo.color === "orange" ? "outline" : 
                                      "destructive"
                                    }
                                    className={
                                      statusInfo.color === "orange" 
                                        ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                                        : ""
                                    }
                                  >
                                    {statusInfo.daysText}
                                  </Badge>
                                </div>
                                
                                <CardContent className="pt-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                      <h3 className="text-lg font-medium">{serviceName}</h3>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <CalendarClock className="h-4 w-4" />
                                          <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>Ends: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleRenew(subscription)}>
                                        Renew
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                      <span>Progress</span>
                                      <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSubscriptions.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">No subscriptions found matching your criteria.</p>
                  </div>
                ) : (
                  sortedSubscriptions.map(subscription => {
                    const serviceName = getServiceName(subscription.serviceId);
                    const customerName = getCustomerName(subscription.userId);
                    const statusInfo = getSubscriptionStatus(subscription.endDate);
                    const progressPercent = calculateProgressPercentage(subscription.startDate, subscription.endDate);
                    
                    return (
                      <Card 
                        key={subscription.id} 
                        className={`border ${statusInfo.borderColor} overflow-hidden`}
                      >
                        <div className={`${statusInfo.bgColor} px-4 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            <span className={`font-medium ${statusInfo.textColor}`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              statusInfo.color === "green" ? "default" : 
                              statusInfo.color === "orange" ? "outline" : 
                              "destructive"
                            }
                            className={
                              statusInfo.color === "orange" 
                                ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                                : ""
                            }
                          >
                            {statusInfo.daysText}
                          </Badge>
                        </div>
                        
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">{serviceName}</h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setSelectedCustomerId(subscription.userId)}
                                >
                                  {customerName}
                                </Button>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />
                                  <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Ends: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRenew(subscription)}>
                                Renew
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress 
                              value={progressPercent} 
                              className="h-2" 
                              indicatorClassName={statusInfo.color === "destructive" ? "bg-red-400" : undefined}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expiring-soon">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <h3 className="font-medium text-amber-800 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Subscriptions Expiring Soon</span>
              </h3>
              <p className="text-sm text-amber-700">
                These subscriptions will expire within the next 30 days. Consider renewing these subscriptions or notifying your customers.
              </p>
              
              {soonExpiringSubscriptions.length > 0 && (
                <Button 
                  className="mt-3" 
                  size="sm"
                  onClick={() => handleBulkRenew(soonExpiringSubscriptions)}
                >
                  Bulk Renew All
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {soonExpiringSubscriptions.length === 0 ? (
                <div className="text-center p-8 bg-muted rounded-md">
                  <p className="text-muted-foreground">No subscriptions expiring soon matching your criteria.</p>
                </div>
              ) : (
                soonExpiringSubscriptions.map(subscription => {
                  const serviceName = getServiceName(subscription.serviceId);
                  const customerName = getCustomerName(subscription.userId);
                  const statusInfo = getSubscriptionStatus(subscription.endDate);
                  const progressPercent = calculateProgressPercentage(subscription.startDate, subscription.endDate);
                  
                  return (
                    <Card 
                      key={subscription.id} 
                      className="border border-amber-200 overflow-hidden"
                    >
                      <div className="bg-amber-50 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-800">
                            Expiring Soon
                          </span>
                        </div>
                        <Badge 
                          variant="outline"
                          className="border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100"
                        >
                          {statusInfo.daysText}
                        </Badge>
                      </div>
                      
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">{serviceName}</h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                onClick={() => setSelectedCustomerId(subscription.userId)}
                              >
                                {customerName}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-4 w-4" />
                                <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Ends: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleRenew(subscription)}>
                              Renew Now
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="expired">
            <div className="space-y-4">
              {expiredSubscriptions.length === 0 ? (
                <div className="text-center p-8 bg-muted rounded-md">
                  <p className="text-muted-foreground">No expired subscriptions found matching your criteria.</p>
                </div>
              ) : (
                expiredSubscriptions.map(subscription => {
                  const serviceName = getServiceName(subscription.serviceId);
                  const customerName = getCustomerName(subscription.userId);
                  
                  return (
                    <Card 
                      key={subscription.id} 
                      className="border border-red-200 overflow-hidden"
                    >
                      <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            Expired
                          </span>
                        </div>
                        <Badge variant="destructive">
                          Expired on {format(parseISO(subscription.endDate), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">{serviceName}</h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                onClick={() => setSelectedCustomerId(subscription.userId)}
                              >
                                {customerName}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-4 w-4" />
                                <span>Started: {format(parseISO(subscription.startDate), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Expired: {format(parseISO(subscription.endDate), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleRenew(subscription)}>
                              Reactivate
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Progress value={100} className="h-2 bg-red-100" indicatorClassName="bg-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WholesaleSubscriptionManager;
