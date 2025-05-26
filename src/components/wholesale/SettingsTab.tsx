
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/lib/toast';
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import WholesaleProfileForm from './settings/WholesaleProfileForm';
import WholesaleNotificationSettings from './settings/WholesaleNotificationSettings';
import WholesaleSecuritySettings from './settings/WholesaleSecuritySettings';
import { useNavigate } from 'react-router-dom';

const SettingsTab: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load the wholesaler username from local storage
    const storedUsername = localStorage.getItem('wholesalerUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // Clear wholesale authentication
    localStorage.removeItem('wholesaleAuthenticated');
    localStorage.removeItem('wholesalerId');
    
    toast.success('Logged out successfully');
    navigate('/wholesale');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => toast.success('Settings updated')}
            className="hidden sm:flex"
          >
            <Settings className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="hidden sm:flex"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center justify-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WholesaleProfileForm username={username} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WholesaleNotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WholesaleSecuritySettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center sm:hidden">
        <div className="flex flex-col gap-4">
          <Button onClick={() => toast.success('Settings updated')}>
            <Settings className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
          
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsTab;
