
import React from 'react';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import CustomerRequests from "@/components/CustomerRequests";
import CustomerOrders from "@/components/CustomerOrders";

const AdminCustomerData: React.FC = () => {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <h1 className="text-3xl font-bold mb-6">Customer Data Management</h1>
        
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">Customer Requests</TabsTrigger>
            <TabsTrigger value="orders">Customer Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <CustomerRequests />
          </TabsContent>
          
          <TabsContent value="orders">
            <CustomerOrders />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default AdminCustomerData;
