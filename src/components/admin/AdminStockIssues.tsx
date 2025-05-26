
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Service, StockRequest } from '@/lib/types';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

interface AdminStockIssuesProps {
  services?: Service[];
}

interface RawStockIssue {
  id: string;
  user_id: string;
  service_id: string;
  order_id: string;
  status: string;
  created_at: string;
  resolved_at: string;
  notes?: string;
}

const AdminStockIssues: React.FC<AdminStockIssuesProps> = ({ services }) => {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStockRequests();
  }, []);

  const fetchStockRequests = async () => {
    try {
      setLoading(true);
      // Try to get data from Supabase if available
      const { data, error } = await supabase
        .from('stock_issue_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match StockRequest type
      const transformedData: StockRequest[] = (data || []).map((item: RawStockIssue) => {
        // Find service name if services array is available
        let serviceName = "";
        if (services) {
          const service = services.find(s => s.id === item.service_id);
          if (service) {
            serviceName = service.name;
          }
        }

        return {
          id: item.id,
          userId: item.user_id,
          serviceId: item.service_id,
          serviceName: serviceName, // Use found name or empty string
          orderId: item.order_id,
          status: item.status as 'pending' | 'fulfilled' | 'cancelled',
          createdAt: item.created_at,
          fulfilledAt: item.resolved_at, // Map resolved_at to fulfilledAt
          customerName: "Unknown customer", // Default value
          priority: "low" as 'high' | 'medium' | 'low', // Default priority
          notes: item.notes || ''
        };
      });

      setStockRequests(transformedData);
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      toast.error('Failed to load stock requests');
      
      // Fallback to localStorage if Supabase fails
      const storedRequests = localStorage.getItem('stock_requests');
      if (storedRequests) {
        try {
          setStockRequests(JSON.parse(storedRequests));
        } catch (e) {
          console.error('Error parsing stock requests from localStorage:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term
  const filteredRequests = stockRequests.filter(request => 
    request.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFulfillRequest = async (requestId: string) => {
    // Implementation would go here - update status to 'fulfilled'
    toast.success('Request fulfilled');
  };

  const handleCancelRequest = async (requestId: string) => {
    // Implementation would go here - update status to 'cancelled'
    toast.success('Request cancelled');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Stock Issues</CardTitle>
          <CardDescription>
            Handle customer requests for stock
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStockRequests}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No stock issues found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.serviceName || request.serviceId}</TableCell>
                  <TableCell>{request.customerName || 'Unknown customer'}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "pending" ? "outline" : 
                        request.status === "fulfilled" ? "default" : 
                        "secondary"
                      }
                      className="flex items-center w-fit gap-1"
                    >
                      {request.status === "pending" ? (
                        <Clock className="h-3 w-3" />
                      ) : request.status === "fulfilled" ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.priority === "high" ? "destructive" : 
                        request.priority === "medium" ? "outline" : 
                        "secondary"
                      }
                      className="flex items-center w-fit gap-1"
                    >
                      {request.priority === "high" && <AlertTriangle className="h-3 w-3" />}
                      {request.priority || "low"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {request.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFulfillRequest(request.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Fulfill
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminStockIssues;
