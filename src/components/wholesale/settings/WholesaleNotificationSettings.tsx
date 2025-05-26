
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { Save } from 'lucide-react';

const WholesaleNotificationSettings = () => {
  const [username, setUsername] = useState<string>('');
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    priceChanges: true,
    newProducts: true,
    specialOffers: false,
    stockAlerts: true,
    marketingEmails: false,
    accountNotifications: true
  });

  useEffect(() => {
    // Load the wholesaler username from local storage
    const storedUsername = localStorage.getItem('wholesalerUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      
      // Load user-specific notification preferences
      const savedPreferences = localStorage.getItem(`wholesaleNotifications_${storedUsername}`);
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences(parsedPreferences);
        } catch (error) {
          console.error("Error parsing saved preferences:", error);
        }
      }
    }
  }, []);

  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast.error("No user identified. Please log in again.");
      return;
    }
    
    // Save to localStorage with user-specific key
    localStorage.setItem(`wholesaleNotifications_${username}`, JSON.stringify(preferences));
    
    // Show success message
    toast.success("Notification preferences updated");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="orderUpdates" className="flex flex-col">
            <span>Order Updates</span>
            <span className="text-xs text-muted-foreground">Receive notifications about your order status</span>
          </Label>
          <Switch
            id="orderUpdates"
            checked={preferences.orderUpdates}
            onCheckedChange={() => handleToggleChange('orderUpdates')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="priceChanges" className="flex flex-col">
            <span>Price Changes</span>
            <span className="text-xs text-muted-foreground">Get notified when product prices change</span>
          </Label>
          <Switch
            id="priceChanges"
            checked={preferences.priceChanges}
            onCheckedChange={() => handleToggleChange('priceChanges')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="newProducts" className="flex flex-col">
            <span>New Products</span>
            <span className="text-xs text-muted-foreground">Receive alerts about new product arrivals</span>
          </Label>
          <Switch
            id="newProducts"
            checked={preferences.newProducts}
            onCheckedChange={() => handleToggleChange('newProducts')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="specialOffers" className="flex flex-col">
            <span>Special Offers</span>
            <span className="text-xs text-muted-foreground">Get notified about exclusive deals and offers</span>
          </Label>
          <Switch
            id="specialOffers"
            checked={preferences.specialOffers}
            onCheckedChange={() => handleToggleChange('specialOffers')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="stockAlerts" className="flex flex-col">
            <span>Stock Alerts</span>
            <span className="text-xs text-muted-foreground">Receive notifications when items are back in stock</span>
          </Label>
          <Switch
            id="stockAlerts"
            checked={preferences.stockAlerts}
            onCheckedChange={() => handleToggleChange('stockAlerts')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="marketingEmails" className="flex flex-col">
            <span>Marketing Emails</span>
            <span className="text-xs text-muted-foreground">Receive promotional content via email</span>
          </Label>
          <Switch
            id="marketingEmails"
            checked={preferences.marketingEmails}
            onCheckedChange={() => handleToggleChange('marketingEmails')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="accountNotifications" className="flex flex-col">
            <span>Account Notifications</span>
            <span className="text-xs text-muted-foreground">Receive security and account-related alerts</span>
          </Label>
          <Switch
            id="accountNotifications"
            checked={preferences.accountNotifications}
            onCheckedChange={() => handleToggleChange('accountNotifications')}
          />
        </div>
      </div>
      
      <Button type="submit">
        <Save className="mr-2 h-4 w-4" />
        Save Preferences
      </Button>
    </form>
  );
};

export default WholesaleNotificationSettings;
