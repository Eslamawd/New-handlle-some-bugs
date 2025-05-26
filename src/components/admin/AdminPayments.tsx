
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Payment, PaymentStatus, CustomerNotification } from "@/lib/types";
import { Check, X, AlertTriangle, ExternalLink, Filter, RefreshCw, BellRing } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/lib/toast";
import { addCustomerBalance } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newPaymentNotification, setNewPaymentNotification] = useState(false);
  
  // Fetch payments from Supabase
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching payments:', error);
        toast.error("Failed to load payments");
      } else {
        console.log('Fetched payments:', data);
        if (data) {
          // Transform data to match our Payment type
          const transformedPayments: Payment[] = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            amount: item.amount,
            status: item.status as PaymentStatus,
            createdAt: item.created_at,
            method: item.method,
            description: item.description || undefined,
            notes: item.notes || undefined,
            userName: item.user_name || undefined,
            userEmail: item.user_email || undefined,
            transactionId: item.transaction_id || undefined,
            receiptUrl: item.receipt_url || undefined,
            reviewedAt: item.reviewed_at || undefined,
            orderId: item.order_id || undefined
          }));
          setPayments(transformedPayments);
          setNewPaymentNotification(false);
        }
      }
    } catch (error) {
      console.error('Exception fetching payments:', error);
      toast.error("Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Set up real-time subscription for payments
    const paymentsChannel = supabase
      .channel('public:payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments'
      }, (payload) => {
        console.log('Payment changed:', payload);
        // If new payment is inserted, show notification
        if (payload.eventType === 'INSERT') {
          setNewPaymentNotification(true);
          // Play a sound notification
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Error playing notification sound:', e));
        }
        fetchPayments();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(paymentsChannel);
    };
  }, []);

  useEffect(() => {
    let filtered = payments;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }
    
    if (filterMethod !== "all") {
      filtered = filtered.filter(payment => payment.method === filterMethod);
    }
    
    setFilteredPayments(filtered);
  }, [filterStatus, filterMethod, payments]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setNotes(payment.notes || "");
    setDetailsOpen(true);
  };

  const notifyCustomer = async (userId: string, type: 'payment_approved' | 'payment_rejected', amount: number, paymentId: string) => {
    try {
      const notification = {
        user_id: userId,
        type: type,
        title: type === 'payment_approved' ? 'Payment Approved' : 'Payment Rejected',
        message: type === 'payment_approved' 
          ? `Your payment of $${amount.toFixed(2)} has been approved` 
          : `Your payment of $${amount.toFixed(2)} has been rejected`,
        is_read: false,
        amount: amount
      };
      
      const { error } = await supabase
        .from('admin_notifications')
        .insert(notification);
        
      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (error) {
      console.error('Error in notifyCustomer:', error);
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
    if (!selectedPayment) return;
    
    try {
      setIsLoading(true);
      
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', paymentId);
        
      if (error) {
        console.error('Error updating payment status:', error);
        toast.error("Failed to update payment status");
        return;
      }
      
      if (newStatus === "approved" && selectedPayment.userId) {
        const userId = selectedPayment.userId;
        
        // Update user balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          toast.error("Failed to update user balance");
        } else if (profileData) {
          const newBalance = (profileData.balance || 0) + selectedPayment.amount;
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);
            
          if (updateError) {
            console.error('Error updating user balance:', updateError);
            toast.error("Failed to update user balance");
          } else {
            toast.success(`Added $${selectedPayment.amount.toFixed(2)} to ${selectedPayment.userName}'s balance`);
          }
        }
        
        notifyCustomer(userId, 'payment_approved', selectedPayment.amount, selectedPayment.id);
      } else if (newStatus === "rejected" && selectedPayment.userId) {
        notifyCustomer(selectedPayment.userId, 'payment_rejected', selectedPayment.amount, selectedPayment.id);
      }
      
      toast.success(`Payment ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      setDetailsOpen(false);
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "bank_transfer":
        return "Bank Transfer";
      case "paypal":
        return "PayPal";
      case "usdt":
        return "USDT";
      case "wish_money":
        return "Wish Money";
      case "balance":
        return "Account Balance";
      default:
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "credit_card":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-300">Credit Card</Badge>;
      case "bank_transfer":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Bank Transfer</Badge>;
      case "paypal":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">PayPal</Badge>;
      case "usdt":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">USDT</Badge>;
      case "wish_money":
        return <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-300">Wish Money</Badge>;
      case "balance":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">Account Balance</Badge>;
      default:
        return <Badge variant="outline">{formatMethod(method)}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            Review and approve customer payment requests
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {newPaymentNotification && (
            <div className="animate-pulse">
              <Badge variant="default" className="bg-red-500 flex items-center">
                <BellRing className="h-4 w-4 mr-1" />
                New Payments
              </Badge>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPayments}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="usdt">USDT</SelectItem>
              <SelectItem value="wish_money">Wish Money</SelectItem>
              <SelectItem value="balance">Account Balance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payments found matching the selected filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className={payment.status === 'pending' ? 'bg-yellow-50/30' : ''}>
                  <TableCell className="font-mono text-xs">{typeof payment.id === 'string' ? payment.id.substring(0, 8) : payment.id}</TableCell>
                  <TableCell>
                    {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{payment.userName}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          {selectedPayment && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Review payment information and take action
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="flex justify-between">
                  <span className="font-medium">Payment ID:</span>
                  <span className="font-mono text-sm">{selectedPayment.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{selectedPayment.orderId || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(selectedPayment.createdAt), 'PPP')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedPayment.userName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedPayment.userEmail}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold">${selectedPayment.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Payment Method:</span>
                  <span>{formatMethod(selectedPayment.method)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(selectedPayment.status)}</span>
                </div>
                
                {selectedPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction ID:</span>
                    <span>{selectedPayment.transactionId}</span>
                  </div>
                )}
                
                {selectedPayment.receiptUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium">Receipt:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                    >
                      View Receipt
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {selectedPayment.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Reviewed:</span>
                    <span>{format(new Date(selectedPayment.reviewedAt), 'PPP')}</span>
                  </div>
                )}
                
                <div className="pt-4">
                  <div className="font-medium mb-2">Admin Notes:</div>
                  <Textarea
                    placeholder="Add notes about this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={selectedPayment.status !== 'pending'}
                    className="w-full"
                  />
                </div>
              </div>
              
              {selectedPayment.status === 'pending' && (
                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedPayment.id, 'rejected')}
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={() => handleStatusChange(selectedPayment.id, 'approved')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminPayments;
