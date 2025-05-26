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
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/lib/toast";

interface CustomerOrder {
  id: string;
  serviceId?: string;
  quantity: number;
  customAmount?: string;
  gameAccountId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  additionalInfo?: string;
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load customer orders from localStorage
    const loadedOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    setOrders(loadedOrders);
  }, []);
  
  const handleViewDetails = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };
  
  const handleCompleteOrder = (id: string) => {
    // Find the order to complete
    const orderToComplete = orders.find(order => order.id === id);
    
    if (!orderToComplete) {
      toast.error("Order not found");
      return;
    }
    
    // Get current user balance from localStorage
    const userBalanceStr = localStorage.getItem('userBalance');
    let userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00; // Default to 120 if not set
    
    // Update order status
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, status: 'completed' as const } : order
    );
    
    // Deduct the order amount from user balance
    const newBalance = userBalance - orderToComplete.totalPrice;
    
    // Save new balance and updated orders
    localStorage.setItem('userBalance', newBalance.toString());
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
    
    setOrders(updatedOrders);
    
    toast.success("Order completed", {
      description: `The customer order has been marked as completed and $${orderToComplete.totalPrice.toFixed(2)} has been deducted from the customer balance`
    });
    
    setIsDialogOpen(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Orders</CardTitle>
        <CardDescription>
          View and manage customer orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No customer orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id.split('-')[1]}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{order.customerName || 'N/A'}</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedOrder && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Order #{selectedOrder.id.split('-')[1]}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.createdAt), 'PPP')}
                  </p>
                </div>
                
                {selectedOrder.customerName && (
                  <div>
                    <p className="text-sm font-medium mb-1">Customer</p>
                    <p className="text-sm">{selectedOrder.customerName}</p>
                  </div>
                )}
                
                {selectedOrder.customerEmail && (
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-sm">{selectedOrder.customerEmail}</p>
                  </div>
                )}
                
                {selectedOrder.customerPhone && (
                  <div>
                    <p className="text-sm font-medium mb-1">Phone</p>
                    <p className="text-sm">{selectedOrder.customerPhone}</p>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Quantity</p>
                  <p className="text-sm">{selectedOrder.quantity}</p>
                </div>
                
                {selectedOrder.gameAccountId && (
                  <div>
                    <p className="text-sm font-medium mb-1">Game Account ID</p>
                    <p className="text-sm">{selectedOrder.gameAccountId}</p>
                  </div>
                )}
                
                {selectedOrder.customAmount && (
                  <div>
                    <p className="text-sm font-medium mb-1">Custom Amount</p>
                    <p className="text-sm">{selectedOrder.customAmount}</p>
                  </div>
                )}
                
                {selectedOrder.additionalInfo && (
                  <div>
                    <p className="text-sm font-medium mb-1">Additional Information</p>
                    <p className="text-sm">{selectedOrder.additionalInfo}</p>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Total Amount</p>
                  <p className="text-sm font-medium">${selectedOrder.totalPrice.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <DialogFooter>
                  <Button
                    onClick={() => handleCompleteOrder(selectedOrder.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
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

export default CustomerOrders;
