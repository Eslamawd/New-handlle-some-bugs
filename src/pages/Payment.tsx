import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { Copy, Check, AlertCircle, CreditCard, ExternalLink, Clock, User, LogIn } from "lucide-react";
import { AdminNotification } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wish-money");
  const [amount, setAmount] = useState<string>("10.00");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchUserBalance = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user balance:', error);
          setIsLoading(false);
          return;
        }
        
        setUserBalance(data?.balance || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchUserBalance:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserBalance();
  }, [user, isAuthenticated]);
  
  const wishMoneyAccount = "76349522";
  const bankAccount = {
    name: "Top-Up Account",
    number: "1234 5678 9012 3456",
    routingNumber: "987654321",
    swift: "YOURSWIFT"
  };
  
  const binancePayUrl = "https://www.binance.com/en/pay";
  
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(wishMoneyAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const createPaymentRecord = async (method: string) => {
    if (!user) return null;
    
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        toast.error("Please enter a valid amount");
        return null;
      }
      
      // Create payment record in database
      const paymentData = {
        user_id: user.id,
        user_name: user.name || user.email,
        user_email: user.email,
        method: method,
        amount: amountValue,
        status: 'pending',
        notes: notes,
        created_at: new Date().toISOString()
      };
      
      console.log('Creating payment record:', paymentData);
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select();
        
      if (error) {
        console.error('Error creating payment record:', error);
        toast.error("Failed to record payment. Please try again");
        return null;
      }
      
      console.log('Payment record created:', data);
      
      // Create admin notification
      const notificationData = {
        type: 'payment_request',
        customer_name: user.name || user.email,
        user_id: user.id,
        amount: amountValue,
        payment_method: method,
        message: `New payment request of $${amountValue.toFixed(2)} via ${method}`,
        is_read: false
      };
      
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert(notificationData);
        
      if (notificationError) {
        console.error('Error creating admin notification:', notificationError);
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in createPaymentRecord:', error);
      toast.error("An error occurred while processing your payment");
      return null;
    }
  };

  const handleWishMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please log in to add funds"
      });
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);

    try {
      const paymentRecord = await createPaymentRecord("wish_money");
      
      if (paymentRecord) {
        toast.success(`Your payment request of $${amount} has been recorded`, {
          description: "An administrator will review and approve it soon"
        });
        setPaymentStatus("pending");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCreditCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please log in to add funds"
      });
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const paymentRecord = await createPaymentRecord("credit_card");
      
      if (paymentRecord) {
        toast.success(`Your payment request of $${amount} has been recorded`, {
          description: "An administrator will review and approve it soon"
        });
        setPaymentStatus("pending");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBinancePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please log in to add funds"
      });
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const paymentRecord = await createPaymentRecord("usdt");
      
      if (paymentRecord) {
        toast("Redirecting to Binance Pay...");
        window.open(binancePayUrl, "_blank");
        
        toast.success(`Your payment request of $${amount} has been recorded`, {
          description: "An administrator will review and approve it soon"
        });
        setPaymentStatus("pending");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReturnToShopping = () => {
    navigate("/services");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
            <div className="h-3 w-32 bg-primary/10 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="container py-8"
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be logged in to add funds to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <p className="text-center">
                Please sign in or create an account to continue.
              </p>
              
              <div className="flex gap-4 pt-4">
                <Button variant="default" onClick={() => navigate('/login')} className="flex-1">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate('/register')} className="flex-1">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </MainLayout>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="container py-8"
        >
          <div className="max-w-xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Pending</CardTitle>
                <CardDescription>
                  Your payment is being processed. Please allow some time for it to be verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                
                <p className="mb-4">
                  Thank you for your payment. An administrator has been notified and your account will be credited after verification.
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Payment method: {activeTab === "wish-money" ? "Wish Money" : activeTab === "credit-card" ? "Credit Card" : "Binance Pay"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: ${amount}
                </p>
                
                <div className="mt-6">
                  <Button onClick={handleReturnToShopping} className="w-full">
                    Return to Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <h1 className="text-3xl font-bold mb-8">Add Funds</h1>
        
        <div className="max-w-xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">Your Current Balance</h2>
                  <div className="text-3xl font-bold mt-2">${userBalance.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Select a payment method to add funds to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="wish-money">Wish Money</TabsTrigger>
                  <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                  <TabsTrigger value="binance">Binance Pay</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wish-money" className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Wish Money Account Number:</p>
                        <p className="text-xl font-bold">{wishMoneyAccount}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyAccount}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 rounded-md">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Important:</p>
                      <p>Include your registered username in the payment notes so we can identify your payment.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleWishMoneySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wm-amount">Amount You Sent</Label>
                      <Input
                        id="wm-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes/Reference (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Any reference you included in your payment"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="credit-card" className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <div className="mb-2">
                      <p className="font-medium">Bank Account Details:</p>
                      <p className="text-sm mt-2">Account Name: {bankAccount.name}</p>
                      <p className="text-sm">Account Number: {bankAccount.number}</p>
                      <p className="text-sm">Routing Number: {bankAccount.routingNumber}</p>
                      <p className="text-sm">SWIFT: {bankAccount.swift}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cc-amount">Amount to Add</Label>
                      <Input
                        id="cc-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Proceed to Bank Payment"}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="binance" className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <p className="text-sm">
                      After clicking "Proceed with Binance Pay", you'll be redirected to complete the payment through Binance's secure payment gateway.
                    </p>
                  </div>
                  
                  <form onSubmit={handleBinancePaySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bp-amount">Amount to Add</Label>
                      <Input
                        id="bp-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Proceed with Binance Pay"}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Payment;
