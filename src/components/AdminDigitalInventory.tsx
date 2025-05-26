
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCredentialsList from './admin/AdminCredentialsList';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useServiceManager } from '@/hooks/useServiceManager';
import AddCredentialDialog from './admin/AddCredentialDialog';
import StockIssueManagerComponent from './admin/StockIssueManager';
import { AdminStockManager } from './admin/AdminStockManager';

// Renamed to avoid conflict
const AdminDigitalInventory = () => {
  const [open, setOpen] = useState(false);
  const { services, isLoading, fetchServices } = useServiceManager();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Digital Inventory</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="stock">Stock Management</TabsTrigger>
          <TabsTrigger value="issues">Stock Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="credentials">
          <AdminCredentialsList />
        </TabsContent>
        <TabsContent value="stock">
          <AdminStockManager 
            services={services} 
            isLoading={isLoading} 
            fetchServices={fetchServices} 
          />
        </TabsContent>
        <TabsContent value="issues">
          <StockIssueManagerComponent />
        </TabsContent>
      </Tabs>

      <AddCredentialDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default AdminDigitalInventory;
