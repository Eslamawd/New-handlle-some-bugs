
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WholesaleUserManagement from "./WholesaleUserManagement";
import UserManagement from "./UserManagement";

const AdminCustomersPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
      </div>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="wholesale">Wholesale Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="wholesale" className="mt-6">
          <WholesaleUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomersPage;
