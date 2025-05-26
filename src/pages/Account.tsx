import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationPreferences from "@/components/account/NotificationPreferences";
import SecuritySettings from "@/components/account/SecuritySettings";
import ProfileEditForm from "@/components/account/ProfileEditForm";
import { toast } from "@/lib/toast";
import { differenceInDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Subscription, Service } from "@/lib/types";
import { 
  User,
  Package,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Shield,
  History,
  Calendar,
  Clock,
  Key,
  Copy
} from "lucide-react";

const getUserId = () => {
  let userId = localStorage.getItem('currentUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('currentUserId', userId);
  }
  return userId;
};

const Account: React.FC = () => {
  const userId = getUserId();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [userBalance, setUserBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem(`userProfile_${userId}`);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
    
    const savedBalance = localStorage.getItem(`userBalance_${userId}`);
    if (savedBalance) {
      const balance = parseFloat(savedBalance);
      setUserBalance(balance);
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // First try to get services
        const savedServices = localStorage.getItem('services');
        if (savedServices) {
          setServices(JSON.parse(savedServices));
        }

        // Then try to get user's subscriptions from Supabase
        const { data: subscriptionData, error } = await supabase
          .from('subscriptions')
          .select('*, credential_stock:credential_stock_id(*)')
          .eq('user_id', userId)
          .order('end_date', { ascending: false });

        if (error) {
          console.error('Error fetching subscriptions:', error);
          // Try fallback to localStorage
          const savedSubscriptions = localStorage.getItem('subscriptions');
          if (savedSubscriptions) {
            const parsedSubs = JSON.parse(savedSubscriptions);
            // Filter to get only this user's subscriptions
            const userSubs = parsedSubs.filter((sub: Subscription) => sub.userId === userId);
            setSubscriptions(userSubs);
          }
        } else if (subscriptionData) {
          // Format subscriptions from Supabase
          const formattedSubscriptions: Subscription[] = subscriptionData.map(subscription => {
            // Parse credentials data properly
            let credentialsObj = undefined;
            
            if (subscription.credential_stock?.credentials) {
              // Handle credentials from credential_stock
              const stockCreds = subscription.credential_stock.credentials;
              credentialsObj = typeof stockCreds === 'string' 
                ? JSON.parse(stockCreds)
                : stockCreds;
            } else if (subscription.credentials) {
              // Handle direct credentials field
              const directCreds = subscription.credentials;
              credentialsObj = typeof directCreds === 'string'
                ? JSON.parse(directCreds)
                : directCreds;
            }
            
            // Ensure credentials matches expected format
            const formattedCredentials = credentialsObj ? {
              username: credentialsObj.username || '',
              password: credentialsObj.password || '',
              email: credentialsObj.email || '',
              notes: credentialsObj.notes || '',
              ...(credentialsObj || {})
            } : undefined;
            
            return {
              id: subscription.id,
              userId: subscription.user_id,
              serviceId: subscription.service_id,
              startDate: subscription.start_date,
              endDate: subscription.end_date,
              status: subscription.status as 'active' | 'expired' | 'cancelled',
              durationMonths: subscription.duration_months || undefined,
              credentials: formattedCredentials
            };
          });
          
          setSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = () => {
    // Remove user ID and reset to guest state
    localStorage.removeItem('currentUserId');
    
    // Clear any other user-specific data
    // This ensures the user returns to a complete guest state
    localStorage.removeItem(`userProfile_${userId}`);
    localStorage.removeItem(`userBalance_${userId}`);
    localStorage.removeItem(`transactionHistory_${userId}`);
    localStorage.removeItem(`customerOrders_${userId}`);
    
    toast.success("Logged out successfully");
    
    navigate('/');
  };

  // Helper function to get service name
  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || "Unknown Service";
  };

  // Helper function to calculate days remaining
  const getDaysRemaining = (endDate: string): number => {
    try {
      const end = parseISO(endDate);
      return Math.max(0, differenceInDays(end, new Date()));
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return 0;
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-primary/10 text-primary p-3 rounded-full">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Account</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Package className="mr-2 h-4 w-4" />
              Go to Full Dashboard
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p>{profileData.name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p>{profileData.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p>{profileData.phone || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Balance</label>
                    <p>${userBalance.toFixed(2)}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NotificationPreferences userId={userId} />
              <SecuritySettings userId={userId} />
            </div>
            
            <ProfileEditForm 
              isOpen={isEditProfileOpen}
              onClose={() => setIsEditProfileOpen(false)}
              initialData={profileData}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading orders...</div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.length > 0 ? (
                      subscriptions.slice(0, 2).map(subscription => (
                        <div key={subscription.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                          <div>
                            <h3 className="font-medium">{getServiceName(subscription.serviceId)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(subscription.startDate).toLocaleDateString()}
                            </p>
                            <div className="inline-block bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full mt-1">
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </div>
                          </div>
                          <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                            <span className="text-sm font-medium">
                              {subscription.durationMonths ? `${subscription.durationMonths} month${subscription.durationMonths > 1 ? 's' : ''}` : 'Subscription'}
                            </span>
                            <Button size="sm" variant="ghost" asChild className="mt-2">
                              <Link to={`/subscription/${subscription.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No orders found</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link to="/dashboard/transaction-history">
                      <History className="mr-2 h-4 w-4" />
                      View All Orders
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading subscriptions...</div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.filter(sub => sub.status === 'active').length > 0 ? (
                      subscriptions
                        .filter(sub => sub.status === 'active')
                        .map(subscription => {
                          const daysRemaining = getDaysRemaining(subscription.endDate);
                          
                          return (
                            <div key={subscription.id} className="border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 p-2 rounded-md">
                                    <Package className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{getServiceName(subscription.serviceId)}</h3>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="h-3.5 w-3.5 mr-1" />
                                      <span>Expires in {daysRemaining} days</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      <span>
                                        {subscription.durationMonths 
                                          ? `${subscription.durationMonths} month subscription` 
                                          : 'Ongoing subscription'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                                  <Button size="sm" variant="outline" asChild className="mt-2">
                                    <Link to={`/subscription/${subscription.id}`}>Manage</Link>
                                  </Button>
                                </div>
                              </div>
                              
                              {subscription.credentials && (
                                <div className="mt-2 bg-muted/30 rounded-md p-3">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <Key className="h-4 w-4 mr-1" />
                                    Access Credentials
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {subscription.credentials.email && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Email:</span>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{subscription.credentials.email}</span>
                                      </div>
                                    )}
                                    {subscription.credentials.username && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Username:</span>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{subscription.credentials.username}</span>
                                      </div>
                                    )}
                                    {subscription.credentials.password && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Password:</span>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{subscription.credentials.password}</span>
                                      </div>
                                    )}
                                    {subscription.credentials.pinCode && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">PIN:</span>
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{subscription.credentials.pinCode}</span>
                                      </div>
                                    )}
                                  </div>
                                  {subscription.credentials.notes && (
                                    <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                                      <span className="text-sm text-muted-foreground">Notes: </span>
                                      <span className="text-sm">{subscription.credentials.notes}</span>
                                    </div>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="mt-2 text-xs" 
                                    onClick={() => {
                                      const credText = Object.entries(subscription.credentials || {})
                                        .filter(([key, value]) => value && typeof value === 'string')
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join('\n');
                                      navigator.clipboard.writeText(credText);
                                      toast.success("Credentials copied to clipboard");
                                    }}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy All
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No active subscriptions</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visa ending in 4242</h3>
                      <p className="text-sm text-muted-foreground">Expires 04/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Invoice #INV-001</h3>
                      <p className="text-sm text-muted-foreground">May 15, 2023</p>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$29.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">Download</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Invoice #INV-002</h3>
                      <p className="text-sm text-muted-foreground">April 15, 2023</p>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$29.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">Download</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Language</h3>
                      <p className="text-sm text-muted-foreground">Change your preferred language</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 sm:mt-0">English (US)</Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Timezone</h3>
                      <p className="text-sm text-muted-foreground">Set your local timezone</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 sm:mt-0">(UTC-05:00) Eastern Time</Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button size="sm" variant="destructive" className="mt-2 sm:mt-0">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Account;
