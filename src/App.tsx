
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import AdminPanel from "./pages/AdminPanel";
import AdminAuth from "./components/AdminAuth";
import NotFound from "./pages/NotFound";
import Wholesale from "./pages/Wholesale";
import TransactionHistory from "./pages/TransactionHistory";
import Support from "./pages/Support";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import WholesaleAuth from "./components/wholesale/WholesaleAuth";

const queryClient = new QueryClient();

// PayPal configuration
const paypalOptions = {
  clientId: "test",
  currency: "USD",
  intent: "capture",
  components: "buttons"
};

// Protected route that requires authentication
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin authentication check with device verification
const AdminRoute = ({ children }) => {
  const checkAdminAuth = () => {
    // Check localStorage with expiration
    const isLocalAuth = localStorage.getItem("adminAuthenticated") === "true";
    if (isLocalAuth) {
      const expiration = localStorage.getItem("adminAuthExpires");
      if (expiration && parseInt(expiration) < Date.now()) {
        // Expired auth
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminAuthExpires");
        localStorage.removeItem("adminDeviceId");
        return false;
      }
      
      // Verify device ID if present
      const savedDeviceId = localStorage.getItem("adminDeviceId");
      const currentDeviceId = localStorage.getItem("deviceId");
      if (savedDeviceId && currentDeviceId && savedDeviceId !== currentDeviceId) {
        // Device mismatch, potential security issue
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminAuthExpires");
        localStorage.removeItem("adminDeviceId");
        console.warn("Admin auth: Device ID mismatch");
        return false;
      }
      
      return true;
    }
    
    // Check sessionStorage
    const isSessionAuth = sessionStorage.getItem("adminAuthenticated") === "true";
    if (isSessionAuth) {
      // Verify device ID if present
      const savedDeviceId = sessionStorage.getItem("adminDeviceId");
      const currentDeviceId = localStorage.getItem("deviceId");
      if (savedDeviceId && currentDeviceId && savedDeviceId !== currentDeviceId) {
        // Device mismatch, potential security issue
        sessionStorage.removeItem("adminAuthenticated");
        sessionStorage.removeItem("adminDeviceId");
        console.warn("Admin auth: Device ID mismatch");
        return false;
      }
      
      return true;
    }
    
    return false;
  };
  
  const isAuthenticated = checkAdminAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-auth" replace />;
  }
  
  return children;
};

// Wholesale route protection
const WholesaleRoute = ({ children }) => {
  const checkWholesaleAuth = () => {
    // Check localStorage with expiration
    const isLocalAuth = localStorage.getItem("wholesaleAuthenticated") === "true";
    if (isLocalAuth) {
      const expiration = localStorage.getItem("wholesaleAuthExpires");
      if (expiration && parseInt(expiration) < Date.now()) {
        // Expired auth
        localStorage.removeItem("wholesaleAuthenticated");
        localStorage.removeItem("wholesaleAuthExpires");
        localStorage.removeItem("wholesalerId");
        localStorage.removeItem("wholesaleDeviceId");
        return false;
      }
      
      // Verify device ID if present
      const savedDeviceId = localStorage.getItem("wholesaleDeviceId");
      const currentDeviceId = localStorage.getItem("deviceId");
      if (savedDeviceId && currentDeviceId && savedDeviceId !== currentDeviceId) {
        // Device mismatch, potential security issue
        localStorage.removeItem("wholesaleAuthenticated");
        localStorage.removeItem("wholesaleAuthExpires");
        localStorage.removeItem("wholesalerId");
        localStorage.removeItem("wholesaleDeviceId");
        console.warn("Wholesale auth: Device ID mismatch");
        return false;
      }
      
      return true;
    }
    
    // Check sessionStorage
    const isSessionAuth = sessionStorage.getItem("wholesaleAuthenticated") === "true";
    if (isSessionAuth) {
      // Verify device ID if present
      const savedDeviceId = sessionStorage.getItem("wholesaleDeviceId");
      const currentDeviceId = localStorage.getItem("deviceId");
      if (savedDeviceId && currentDeviceId && savedDeviceId !== currentDeviceId) {
        // Device mismatch, potential security issue
        sessionStorage.removeItem("wholesaleAuthenticated");
        sessionStorage.removeItem("wholesalerId");
        sessionStorage.removeItem("wholesaleDeviceId");
        console.warn("Wholesale auth: Device ID mismatch");
        return false;
      }
      
      return true;
    }
    
    return false;
  };
  
  const isAuthenticated = checkWholesaleAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/wholesale-auth" replace />;
  }
  
  return children;
};

const App = () => {
  // Generate device identifier on app load if not exists
  useEffect(() => {
    if (!localStorage.getItem("deviceId")) {
      const nav = navigator.userAgent || "";
      const screen = `${window.screen.width}x${window.screen.height}`;
      const random = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now().toString(36);
      
      const deviceId = btoa(`${nav}-${screen}-${random}-${timestamp}`).substring(0, 36);
      localStorage.setItem("deviceId", deviceId);
    }
    
    // Check for expired sessions
    const checkExpiredSessions = () => {
      // Check admin session
      const adminExpiration = localStorage.getItem("adminAuthExpires");
      if (adminExpiration && parseInt(adminExpiration) < Date.now()) {
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminAuthExpires");
        localStorage.removeItem("adminDeviceId");
      }
      
      // Check wholesale session
      const wholesaleExpiration = localStorage.getItem("wholesaleAuthExpires");
      if (wholesaleExpiration && parseInt(wholesaleExpiration) < Date.now()) {
        localStorage.removeItem("wholesaleAuthenticated");
        localStorage.removeItem("wholesaleAuthExpires");
        localStorage.removeItem("wholesalerId");
        localStorage.removeItem("wholesaleDeviceId");
      }
    };
    
    checkExpiredSessions();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <SubscriptionProvider>
                <PayPalScriptProvider options={paypalOptions}>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        
                        {/* Protected routes that require authentication */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard/*" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        } />
                        <Route path="/payment" element={
                          <ProtectedRoute>
                            <Payment />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard/transaction-history" element={
                          <ProtectedRoute>
                            <TransactionHistory />
                          </ProtectedRoute>
                        } />
                        <Route path="/support" element={
                          <ProtectedRoute>
                            <Support />
                          </ProtectedRoute>
                        } />
                        <Route path="/account" element={
                          <ProtectedRoute>
                            <Account />
                          </ProtectedRoute>
                        } />
                        
                        {/* Public routes */}
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/:id" element={<ServiceDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        
                        {/* Admin routes */}
                        <Route path="/admin-auth" element={<AdminAuth />} />
                        <Route path="/admin/*" element={
                          <AdminRoute>
                            <AdminPanel />
                          </AdminRoute>
                        } />
                        
                        {/* Wholesale routes */}
                        <Route path="/wholesale-auth" element={<WholesaleAuth />} />
                        <Route path="/wholesale" element={
                          <WholesaleRoute>
                            <Wholesale />
                          </WholesaleRoute>
                        } />
                        
                        {/* 404 route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AnimatePresence>
                  </BrowserRouter>
                </PayPalScriptProvider>
              </SubscriptionProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};

export default App;
