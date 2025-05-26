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
import { 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react";
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
import ExportData from "@/components/wholesale/ExportData";

interface CustomerRequest {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: string;
  amount?: string;
  gameAccountId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  additionalInfo?: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected';
}

const CustomerRequests: React.FC = () => {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadedRequests = JSON.parse(localStorage.getItem('customerRequests') || '[]');
    setRequests(loadedRequests);
  }, []);
  
  const handleViewDetails = (request: CustomerRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };
  
  const handleApproveRequest = (id: string) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('customerRequests', JSON.stringify(updatedRequests));
    
    toast.success("Request approved", {
      description: "The customer request has been approved"
    });
    
    setIsDialogOpen(false);
  };
  
  const handleRejectRequest = (id: string) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('customerRequests', JSON.stringify(updatedRequests));
    
    toast.success("Request rejected", {
      description: "The customer request has been rejected"
    });
    
    setIsDialogOpen(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportData = requests.map(req => ({
    ID: req.id,
    Date: format(new Date(req.timestamp), 'PPP'),
    Customer: req.customerName,
    Email: req.customerEmail,
    Phone: req.customerPhone || 'N/A',
    Service: req.serviceName,
    Amount: `$${req.total.toFixed(2)}`,
    Status: req.status,
    GameAccountID: req.gameAccountId || 'N/A',
    RechargeAmount: req.amount || 'N/A',
    AdditionalInfo: req.additionalInfo || 'N/A'
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Requests</CardTitle>
          <CardDescription>
            Manage and process customer information and service requests
          </CardDescription>
        </div>
        <ExportData 
          data={exportData} 
          filename="customer-requests" 
          disabled={requests.length === 0}
        />
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No customer requests found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.timestamp), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{request.customerName}</TableCell>
                  <TableCell>{request.serviceName}</TableCell>
                  <TableCell>${request.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(request)}
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedRequest && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Customer Request Details</DialogTitle>
                <DialogDescription>
                  Request #{selectedRequest.id.split('-')[1]}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedRequest.timestamp), 'PPP')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm">{selectedRequest.customerName}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{selectedRequest.customerEmail}</p>
                  </div>
                </div>
                
                {selectedRequest.customerPhone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm">{selectedRequest.customerPhone}</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Service</p>
                  <p className="text-sm">{selectedRequest.serviceName}</p>
                </div>
                
                {selectedRequest.gameAccountId && (
                  <div>
                    <p className="text-sm font-medium mb-1">Game Account ID</p>
                    <p className="text-sm">{selectedRequest.gameAccountId}</p>
                  </div>
                )}
                
                {selectedRequest.amount && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recharge Amount</p>
                    <p className="text-sm">{selectedRequest.amount}</p>
                  </div>
                )}
                
                {selectedRequest.additionalInfo && (
                  <div>
                    <p className="text-sm font-medium mb-1">Additional Information</p>
                    <p className="text-sm">{selectedRequest.additionalInfo}</p>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-1">Total Amount</p>
                  <p className="text-sm font-medium">${selectedRequest.total.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              
              {selectedRequest.status === 'pending' && (
                <DialogFooter className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
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

export default CustomerRequests;
