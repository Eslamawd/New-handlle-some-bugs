
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Key, User, Clock, AlertTriangle } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { differenceInDays, parseISO } from 'date-fns';
import { products } from '@/lib/data';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface UserSubscriptionsViewProps {
  userId: string;
  userName?: string;
}

const UserSubscriptionsView: React.FC<UserSubscriptionsViewProps> = ({
  userId,
  userName
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching subscriptions for user ID:', userId);
        
        // Fetch ALL subscriptions for the user
        const { data: supabaseSubscriptions, error } = await supabase
          .from('wholesale_subscriptions')
          .select('*')
          .eq('customer_id', userId);
          
        if (error) {
          console.error('Error fetching subscriptions from Supabase:', error);
          loadFromLocalStorage();
          return;
        }
        
        if (supabaseSubscriptions && supabaseSubscriptions.length > 0) {
          console.log(`Found ${supabaseSubscriptions.length} subscriptions in Supabase for user ${userId}`);
          
          const formattedSubs = supabaseSubscriptions.map(sub => {
            let credentialsObj = undefined;
            
            if (sub.credentials) {
              const creds = sub.credentials as any;
              credentialsObj = {
                username: typeof creds === 'object' ? creds.username || '' : '',
                password: typeof creds === 'object' ? creds.password || '' : '',
                email: typeof creds === 'object' ? creds.email || '' : '',
                notes: typeof creds === 'object' ? creds.notes || '' : ''
              };
            }
            
            return {
              id: sub.id,
              userId: sub.customer_id,
              serviceId: sub.service_id,
              startDate: sub.start_date,
              endDate: sub.end_date,
              status: sub.status as 'active' | 'expired' | 'cancelled' | 'pending',
              durationMonths: sub.duration_months,
              credentials: credentialsObj,
              isPending: sub.status === 'pending' || !sub.credentials
            };
          });
          
          // Sort subscriptions by end date (most recent first)
          const sortedSubs = formattedSubs.sort((a, b) => 
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          );
          
          setSubscriptions(sortedSubs);
          console.log('Sorted subscriptions:', sortedSubs);
        } else {
          console.log('No subscriptions found in Supabase, checking localStorage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error in fetchUserSubscriptions:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedSubscriptions = localStorage.getItem('wholesaleSubscriptions');
      if (savedSubscriptions) {
        try {
          const allSubs = JSON.parse(savedSubscriptions);
          console.log('Checking localStorage for user subscriptions');
          
          const userSubs = allSubs
            .filter((sub: Subscription) => sub.userId === userId)
            .map((sub: Subscription) => ({
              ...sub,
              isPending: sub.status === 'pending' || !sub.credentials
            }))
            .sort((a: Subscription, b: Subscription) => 
              new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
            );
            
          console.log(`Found ${userSubs.length} subscriptions in localStorage for user ${userId}`);
          setSubscriptions(userSubs);
        } catch (error) {
          console.error('Error parsing subscriptions from localStorage:', error);
          setSubscriptions([]);
        }
      } else {
        console.log('No subscriptions found in localStorage');
        setSubscriptions([]);
      }
    };
    
    if (userId) {
      fetchUserSubscriptions();
    }
  }, [userId]);

  const getSubscriptionStatus = (subscription: Subscription) => {
    // First check if it's pending due to lack of credentials
    if (subscription.isPending || subscription.status === 'pending' || !subscription.credentials) {
      return { status: "pending", color: "orange" };
    }

    // Then check expiration status
    const today = new Date();
    const end = parseISO(subscription.endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) return { status: "expired", color: "destructive" };
    if (daysLeft <= 3) return { status: `expires in ${daysLeft} days`, color: "orange" };
    return { status: "active", color: "green" };
  };

  const getProductName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : "Unknown Service";
  };

  const groupedSubscriptions = React.useMemo(() => {
    const groups: { [key: string]: Subscription[] } = {};
    
    // Make sure we're actually grouping subscriptions (debug)
    console.log(`Grouping ${subscriptions.length} subscriptions by service`);
    
    subscriptions.forEach(sub => {
      if (!groups[sub.serviceId]) {
        groups[sub.serviceId] = [];
      }
      groups[sub.serviceId].push(sub);
    });
    
    // Log the number of unique services found
    console.log(`Found ${Object.keys(groups).length} unique services`);
    
    return groups;
  }, [subscriptions]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedSubscriptions;
    
    const filtered: { [key: string]: Subscription[] } = {};
    
    Object.entries(groupedSubscriptions).forEach(([serviceId, subs]) => {
      const productName = getProductName(serviceId).toLowerCase();
      const matchingSubs = subs.filter(sub => {
        const credentialMatch = sub.credentials && (
          (sub.credentials.email && sub.credentials.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sub.credentials.username && sub.credentials.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        return productName.includes(searchTerm.toLowerCase()) || credentialMatch;
      });
      
      if (matchingSubs.length > 0) {
        filtered[serviceId] = matchingSubs;
      }
    });
    
    return filtered;
  }, [groupedSubscriptions, searchTerm]);
  
  // Function to save any fixed subscriptions back to Supabase
  const saveSubscriptionsToSupabase = async (fixedSubscriptions: Subscription[]) => {
    if (fixedSubscriptions.length === 0) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        for (const sub of fixedSubscriptions) {
          // Format for Supabase
          const supabaseSub = {
            id: sub.id,
            wholesaler_id: sessionData.session.user.id,
            customer_id: sub.userId,
            service_id: sub.serviceId,
            start_date: sub.startDate,
            end_date: sub.endDate,
            status: sub.status,
            duration_months: sub.durationMonths,
            credentials: sub.credentials,
            updated_at: new Date().toISOString()
          };
          
          // Check if exists first
          const { data: existing } = await supabase
            .from('wholesale_subscriptions')
            .select('id')
            .eq('id', sub.id)
            .single();
            
          if (existing) {
            // Update
            const { error: updateError } = await supabase
              .from('wholesale_subscriptions')
              .update(supabaseSub)
              .eq('id', sub.id);
              
            if (updateError) {
              console.error('Error updating subscription in Supabase:', updateError);
            } else {
              console.log(`Updated subscription ${sub.id} in Supabase`);
            }
          } else {
            // Insert
            const { error: insertError } = await supabase
              .from('wholesale_subscriptions')
              .insert([supabaseSub]);
              
            if (insertError) {
              console.error('Error inserting subscription to Supabase:', insertError);
            } else {
              console.log(`Inserted subscription ${sub.id} to Supabase`);
            }
          }
        }
        
        toast.success('Subscriptions synchronized with database');
      }
    } catch (error) {
      console.error('Error saving subscriptions to Supabase:', error);
    }
  };
  
  // This effect checks for subscriptions with issues and resolves them
  useEffect(() => {
    if (subscriptions.length > 0) {
      const fixedSubscriptions = subscriptions.filter(sub => !sub.id || !sub.userId || !sub.serviceId);
      if (fixedSubscriptions.length > 0) {
        saveSubscriptionsToSupabase(fixedSubscriptions);
      }
    }
  }, [subscriptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {userName ? `${userName}'s Subscriptions` : 'User Subscriptions'}
        </CardTitle>
        <div className="mt-2">
          <InputWithIcon
            placeholder="Search by service or credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            type="search"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No subscriptions found for this user.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredGroups).map(([serviceId, serviceSubs]) => {
              const productName = getProductName(serviceId);
              
              return (
                <div key={serviceId} className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">{productName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceSubs.map((subscription) => {
                      const statusInfo = getSubscriptionStatus(subscription);
                      
                      return (
                        <Card key={subscription.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{productName}</h3>
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
                                {statusInfo.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>Expires: {new Date(subscription.endDate).toLocaleDateString()}</span>
                              </div>
                              
                              {subscription.durationMonths && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{subscription.durationMonths} month{subscription.durationMonths > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                            
                            {subscription.isPending || !subscription.credentials ? (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-1 text-amber-600">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span className="font-medium">Pending Credentials</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Your subscription is active but credentials are being processed.
                                </p>
                              </div>
                            ) : subscription.credentials && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-1 mb-2">
                                  <Key className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Credentials</span>
                                </div>
                                
                                <div className="bg-muted/30 p-2 rounded text-sm">
                                  {subscription.credentials.email && (
                                    <div className="mb-1">
                                      <span className="font-medium">Email:</span> {subscription.credentials.email}
                                    </div>
                                  )}
                                  
                                  {subscription.credentials.password && (
                                    <div className="mb-1">
                                      <span className="font-medium">Password:</span> {subscription.credentials.password}
                                    </div>
                                  )}
                                  
                                  {subscription.credentials.username && (
                                    <div className="mb-1">
                                      <span className="font-medium">Username:</span> {subscription.credentials.username}
                                    </div>
                                  )}
                                  
                                  {subscription.credentials.notes && (
                                    <div className="mt-1 pt-1 border-t border-gray-200">
                                      <span className="font-medium">Notes:</span> {subscription.credentials.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionsView;
