
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { StockRequest, CredentialInput } from '@/lib/types';

interface StockIssue {
  id: string;
  service_id: string;
  service_name?: string;
  order_id?: string;
  customer_name?: string;
  status: 'pending' | 'resolved' | string;
  created_at: string;
  resolved_at?: string;
  notes?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  user_id?: string;
}

const StockIssueManager: React.FC = () => {
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);
  const [pendingIssues, setPendingIssues] = useState<StockIssue[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<StockIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<StockIssue | null>(null);
  const [credentialInput, setCredentialInput] = useState<CredentialInput>({
    username: '',
    password: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchStockIssues();

    // Set up realtime subscription
    const stockIssuesChannel = supabase
      .channel('stock-issues-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stock_issue_logs'
      }, () => {
        fetchStockIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(stockIssuesChannel);
    };
  }, []);

  const fetchStockIssues = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_issue_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching stock issues:', error);
        toast.error('Failed to load stock issues');
        return;
      }
      
      if (data) {
        const typedData = data.map(issue => ({
          ...issue,
          status: issue.status as 'pending' | 'resolved' | string
        }));
        
        setStockIssues(typedData);
        setPendingIssues(typedData.filter(issue => issue.status === 'pending'));
        setResolvedIssues(typedData.filter(issue => issue.status === 'resolved'));
      }
    } catch (error) {
      console.error('Error in fetchStockIssues:', error);
      toast.error('Failed to load stock issues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveIssue = (issue: StockIssue) => {
    setSelectedIssue(issue);
    setIsDialogOpen(true);
  };

  const handleAddCredential = async () => {
    if (!selectedIssue) return;
    
    try {
      // First check if this is a valid credential
      if (!credentialInput.username && !credentialInput.password && !credentialInput.email) {
        toast.error('Please provide at least one credential field');
        return;
      }
      
      // Create a new credential stock entry
      const credentialId = `cred-${Date.now()}`;
      const { error: credentialError } = await supabase
        .from('credential_stock')
        .insert({
          id: credentialId,
          service_id: selectedIssue.service_id,
          credentials: credentialInput as any, // Type assertion to bypass type check
          status: 'available',
          created_at: new Date().toISOString()
        });
        
      if (credentialError) {
        console.error('Error creating credential:', credentialError);
        toast.error('Failed to create credential');
        return;
      }
      
      // Now that we have a credential, resolve the issue
      if (selectedIssue.order_id) {
        // This is an order-related issue, update the order
        const { data: orderData, error: orderFetchError } = await supabase
          .from('wholesale_orders')
          .select('*')
          .eq('id', selectedIssue.order_id)
          .single();
          
        if (!orderFetchError && orderData) {
          // It's a wholesale order
          const { error: orderUpdateError } = await supabase
            .from('wholesale_orders')
            .update({
              status: 'completed',
              credentials: credentialInput as any // Type assertion
            })
            .eq('id', selectedIssue.order_id);
            
          if (orderUpdateError) {
            console.error('Error updating wholesale order:', orderUpdateError);
          } else {
            // Check if there's a subscription to update
            const { data: subData, error: subFetchError } = await supabase
              .from('wholesale_subscriptions')
              .select('*')
              .eq('customer_id', orderData.customer_id)
              .eq('service_id', orderData.service_id)
              .single();
              
            if (!subFetchError && subData) {
              const { error: subUpdateError } = await supabase
                .from('wholesale_subscriptions')
                .update({
                  status: 'active',
                  credentials: credentialInput as any // Type assertion
                })
                .eq('id', subData.id);
                
              if (subUpdateError) {
                console.error('Error updating wholesale subscription:', subUpdateError);
              }
            }
          }
        } else {
          // Check if it's a regular order
          const { data: regOrderData, error: regOrderFetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', selectedIssue.order_id)
            .single();
            
          if (!regOrderFetchError && regOrderData) {
            const { error: regOrderUpdateError } = await supabase
              .from('orders')
              .update({
                status: 'completed',
                credentials: credentialInput as any, // Type assertion
                completed_at: new Date().toISOString()
              })
              .eq('id', selectedIssue.order_id);
              
            if (regOrderUpdateError) {
              console.error('Error updating regular order:', regOrderUpdateError);
            } else {
              // Check if there's a subscription to update
              const { data: regSubData, error: regSubFetchError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', regOrderData.user_id)
                .eq('service_id', regOrderData.service_id)
                .single();
                
              if (!regSubFetchError && regSubData) {
                const { error: regSubUpdateError } = await supabase
                  .from('subscriptions')
                  .update({
                    status: 'active',
                    credentials: credentialInput as any, // Type assertion
                    credential_stock_id: credentialId
                  })
                  .eq('id', regSubData.id);
                  
                if (regSubUpdateError) {
                  console.error('Error updating regular subscription:', regSubUpdateError);
                }
              }
            }
          }
        }
      }
      
      // Update the credential to assigned status
      const { error: updateCredentialError } = await supabase
        .from('credential_stock')
        .update({
          status: 'assigned',
          order_id: selectedIssue.order_id
        })
        .eq('id', credentialId);
        
      if (updateCredentialError) {
        console.error('Error updating credential status:', updateCredentialError);
      }
      
      // Update the stock issue
      const { error: updateIssueError } = await supabase
        .from('stock_issue_logs')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          notes: `Resolved with credential ID: ${credentialId}`
        })
        .eq('id', selectedIssue.id);
        
      if (updateIssueError) {
        console.error('Error updating stock issue:', updateIssueError);
        toast.error('Failed to update stock issue');
        return;
      }
      
      toast.success('Stock issue resolved successfully');
      setIsDialogOpen(false);
      setCredentialInput({
        username: '',
        password: '',
        email: '',
        notes: ''
      });
      
      // Refresh the list
      fetchStockIssues();
      
      // Dispatch event for other components to refresh
      window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
      
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast.error('Failed to resolve issue');
    }
  };

  const displayIssues = activeTab === "pending" 
    ? pendingIssues 
    : activeTab === "resolved" 
      ? resolvedIssues 
      : stockIssues;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Stock Issues</CardTitle>
            <CardDescription>
              Manage stock issues and assign credentials to pending orders
            </CardDescription>
          </div>
          {pendingIssues.length > 0 && (
            <Badge variant="destructive" className="flex gap-1">
              <AlertTriangle className="h-3 w-3" />
              {pendingIssues.length} Pending
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingIssues.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingIssues.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : displayIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab} issues found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-mono text-xs">{issue.id}</TableCell>
                        <TableCell>{issue.service_name || issue.service_id}</TableCell>
                        <TableCell className="font-mono text-xs">{issue.order_id || 'N/A'}</TableCell>
                        <TableCell>{issue.customer_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {issue.status === 'pending' && <Clock className="h-3 w-3" />}
                            {issue.status === 'resolved' && <CheckCircle className="h-3 w-3" />}
                            {issue.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(issue.created_at), 'PPP')}
                        </TableCell>
                        <TableCell>
                          {issue.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleResolveIssue(issue)}
                            >
                              <Plus className="h-3 w-3" />
                              Add Credential
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 text-xs text-muted-foreground flex justify-between">
          <span>Total Issues: {stockIssues.length}</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Pending: {pendingIssues.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Resolved: {resolvedIssues.length}
            </span>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credential for {selectedIssue?.service_name}</DialogTitle>
            <DialogDescription>
              Add credential details to resolve the pending order for {selectedIssue?.customer_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                className="col-span-3"
                value={credentialInput.username || ''}
                onChange={(e) => setCredentialInput({...credentialInput, username: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                value={credentialInput.password || ''}
                onChange={(e) => setCredentialInput({...credentialInput, password: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={credentialInput.email || ''}
                onChange={(e) => setCredentialInput({...credentialInput, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="col-span-3"
                value={credentialInput.notes || ''}
                onChange={(e) => setCredentialInput({...credentialInput, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCredential}>
              Add Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StockIssueManager;
