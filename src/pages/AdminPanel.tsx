import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import AdminSupportTickets from "@/components/AdminSupportTickets";
import AdminBalanceManagement from "@/components/AdminBalanceManagement";
import AdminDigitalInventory from "@/components/AdminDigitalInventory";
import AdminNotifications from "@/components/AdminNotifications";
import AdminCustomersPage from "@/components/admin/AdminCustomersPage";
import AdminPayments from "@/components/admin/AdminPayments";
import SubscriptionIssues from "@/components/admin/SubscriptionIssues";
import AdminChatMessages from "@/components/admin/AdminChatMessages";
import AdminGmailSettings from "@/components/admin/AdminGmailSettings";
import NotificationBadge from "@/components/admin/NotificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Package, ShoppingCart, TicketCheck, 
  BarChart3, Settings, AlertCircle, PlusCircle,
  Server, LogOut, CreditCard, LayoutDashboard,
  DollarSign, AlertTriangle, MessageSquare, Mail
} from "lucide-react";
import { toast } from "@/lib/toast";

import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminServices from "@/components/admin/AdminServices";
import { AdminOrders } from "@/components/admin/AdminOrders";
import AdminCustomization from "@/components/admin/AdminCustomization";
import StockIssueManager from "@/components/admin/StockIssueManager";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [pendingStockIssuesCount, setPendingStockIssuesCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (localStorage.getItem("adminAuthenticated") === "true") {
        const expiration = localStorage.getItem("adminAuthExpires");
        if (expiration && parseInt(expiration) < Date.now()) {
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("adminAuthExpires");
          localStorage.removeItem("adminDeviceId");
          navigate("/admin-auth");
          return false;
        }
        return true;
      }
      
      if (sessionStorage.getItem("adminAuthenticated") === "true") {
        return true;
      }
      
      navigate("/admin-auth");
      return false;
    };
    
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      fetchPendingCounts();
    }
    
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const stockChannel = supabase
      .channel('stock-issues-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stock_issue_logs'
      }, () => {
        fetchPendingCounts();
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wholesale_orders'
      }, () => {
        fetchPendingCounts();
      })
      .subscribe();

    const authCheckInterval = setInterval(() => {
      const isStillAuth = checkAuthStatus();
      if (!isStillAuth) {
        navigate("/admin-auth");
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => {
      supabase.removeChannel(stockChannel);
      supabase.removeChannel(ordersChannel);
      clearInterval(authCheckInterval);
    };
  }, [isAuthenticated, navigate]);

  const checkAuthStatus = () => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
      const expiration = localStorage.getItem("adminAuthExpires");
      if (expiration && parseInt(expiration) < Date.now()) {
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminAuthExpires");
        localStorage.removeItem("adminDeviceId");
        return false;
      }
      return true;
    }
    
    return sessionStorage.getItem("adminAuthenticated") === "true";
  };

  const fetchPendingCounts = async () => {
    try {
      const { count: stockIssuesCount, error: stockError } = await supabase
        .from('stock_issue_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (stockError) {
        console.error('Error fetching pending stock issues:', stockError);
      } else {
        setPendingStockIssuesCount(stockIssuesCount || 0);
      }

      const { count: ordersCount, error: ordersError } = await supabase
        .from('wholesale_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (ordersError) {
        console.error('Error fetching pending orders:', ordersError);
      } else {
        setPendingOrdersCount(ordersCount || 0);
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminAuthExpires");
    localStorage.removeItem("adminDeviceId");
    sessionStorage.removeItem("adminAuthenticated");
    sessionStorage.removeItem("adminDeviceId");
    
    toast.success("You have been logged out of the admin panel");
    navigate("/");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <AdminNotifications />
            <Button variant="destructive" size="sm" onClick={handleLogout} className="flex gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customers")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Customers
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/services")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Services
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start relative" 
                    onClick={() => navigate("/admin/orders")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                    <NotificationBadge count={pendingOrdersCount} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/issues")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Subscription Issues
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/payments")}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payments
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/chat-messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat Messages
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/gmail-settings")}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Gmail Integration
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/inventory")}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Digital Inventory
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start relative" 
                    onClick={() => navigate("/admin/stock-issues")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Stock Issues
                    <NotificationBadge count={pendingStockIssuesCount} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/balance")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    User Balance
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customization")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Customization
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/support")}
                  >
                    <TicketCheck className="mr-2 h-4 w-4" />
                    Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/reports")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/customers" element={<AdminCustomersPage />} />
              <Route path="/services" element={<AdminServices />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/issues" element={<SubscriptionIssues />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/chat-messages" element={<AdminChatMessages />} />
              <Route path="/gmail-settings" element={<AdminGmailSettings />} />
              <Route path="/inventory" element={<AdminDigitalInventory />} />
              <Route path="/stock-issues" element={<StockIssueManager />} />
              <Route path="/balance" element={<AdminBalanceManagement />} />
              <Route path="/customization" element={<AdminCustomization />} />
              <Route path="/support" element={<AdminSupportTickets />} />
              <Route path="/reports" element={<div>Reports and Analytics</div>} />
              <Route path="/settings" element={<div>Admin Settings</div>} />
            </Routes>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AdminPanel;
