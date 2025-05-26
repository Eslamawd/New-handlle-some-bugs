
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Service } from '@/lib/types';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Plus } from 'lucide-react';
import AddCredentialDialog from './AddCredentialDialog';

interface AdminStockManagerProps {
  services: Service[];
  isLoading: boolean;
  fetchServices: () => void;
}

export function AdminStockManager({ services, isLoading, fetchServices }: AdminStockManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockCounts, setStockCounts] = useState<Record<string, { available: number, assigned: number }>>({});
  const [loadingStock, setLoadingStock] = useState(true);
  const [isAddCredentialOpen, setIsAddCredentialOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Fetch stock counts when component mounts
  useEffect(() => {
    fetchStockData();
    
    // Listen for credential added event
    const handleCredentialAdded = () => {
      fetchStockData();
    };
    
    window.addEventListener('credential-added', handleCredentialAdded);
    window.addEventListener('stock-issue-resolved', handleCredentialAdded);
    
    return () => {
      window.removeEventListener('credential-added', handleCredentialAdded);
      window.removeEventListener('stock-issue-resolved', handleCredentialAdded);
    };
  }, [services]);
  
  // Filtered services based on search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch stock counts for each service
  const fetchStockData = async () => {
    if (!services.length) return;
    
    setLoadingStock(true);
    try {
      const { data, error } = await supabase
        .from('credential_stock')
        .select('service_id, status')
        
      if (error) {
        throw error;
      }
      
      // Calculate counts for each service
      const counts: Record<string, { available: number, assigned: number }> = {};
      
      // Initialize counts for all services
      services.forEach(service => {
        counts[service.id] = { available: 0, assigned: 0 };
      });
      
      // Count items in stock
      (data || []).forEach(item => {
        if (!counts[item.service_id]) {
          counts[item.service_id] = { available: 0, assigned: 0 };
        }
        
        if (item.status === 'available') {
          counts[item.service_id].available++;
        } else if (item.status === 'assigned') {
          counts[item.service_id].assigned++;
        }
      });
      
      setStockCounts(counts);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoadingStock(false);
    }
  };

  // Fetch pending stock issues
  const [pendingIssues, setPendingIssues] = useState<Record<string, number>>({});
  
  useEffect(() => {
    fetchPendingIssues();
    
    const handleStockIssueResolved = () => {
      fetchPendingIssues();
    };
    
    window.addEventListener('stock-issue-resolved', handleStockIssueResolved);
    
    return () => {
      window.removeEventListener('stock-issue-resolved', handleStockIssueResolved);
    };
  }, [services]);
  
  const fetchPendingIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_issue_logs')
        .select('service_id')
        .eq('status', 'pending');
        
      if (error) {
        throw error;
      }
      
      // Count pending issues for each service
      const counts: Record<string, number> = {};
      
      (data || []).forEach(item => {
        if (!counts[item.service_id]) {
          counts[item.service_id] = 0;
        }
        counts[item.service_id]++;
      });
      
      setPendingIssues(counts);
    } catch (error) {
      console.error('Error fetching pending issues:', error);
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    fetchServices();
    fetchStockData();
    fetchPendingIssues();
    toast.success('Stock data refreshed');
  };

  // Open add credential dialog for a specific service
  const handleAddStock = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsAddCredentialOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Stock Management</CardTitle>
          <CardDescription>
            Manage available stock for services
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Assigned Stock</TableHead>
                <TableHead>Pending Requests</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || loadingStock ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex justify-center items-center py-4">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                      Loading stock data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stockCounts[service.id]?.available > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                        {stockCounts[service.id]?.available || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{stockCounts[service.id]?.assigned || 0}</TableCell>
                    <TableCell>
                      {pendingIssues[service.id] ? (
                        <Badge variant="destructive">{pendingIssues[service.id]}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddStock(service.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <AddCredentialDialog 
        open={isAddCredentialOpen} 
        setOpen={setIsAddCredentialOpen} 
      />
    </Card>
  );
}
