
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface NotificationPreferencesProps {
  userId: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: false
  });

  useEffect(() => {
    // Load user-specific notification preferences from localStorage
    const savedPreferences = localStorage.getItem(`notificationPreferences_${userId}`);
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
      }
    }
  }, [userId]);

  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: !prev[key] };
      
      // Save to localStorage with user-specific key
      localStorage.setItem(`notificationPreferences_${userId}`, JSON.stringify(newPreferences));
      
      // Show success message
      toast.success("Notification preferences updated");
      
      return newPreferences;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications" className="flex flex-col">
            <span>Email Notifications</span>
            <span className="text-xs text-muted-foreground">Receive notifications via email</span>
          </Label>
          <Switch
            id="emailNotifications"
            checked={preferences.emailNotifications}
            onCheckedChange={() => handleToggleChange('emailNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="pushNotifications" className="flex flex-col">
            <span>Push Notifications</span>
            <span className="text-xs text-muted-foreground">Receive notifications on your device</span>
          </Label>
          <Switch
            id="pushNotifications"
            checked={preferences.pushNotifications}
            onCheckedChange={() => handleToggleChange('pushNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="smsNotifications" className="flex flex-col">
            <span>SMS Notifications</span>
            <span className="text-xs text-muted-foreground">Receive notifications via text message</span>
          </Label>
          <Switch
            id="smsNotifications"
            checked={preferences.smsNotifications}
            onCheckedChange={() => handleToggleChange('smsNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="marketingEmails" className="flex flex-col">
            <span>Marketing Emails</span>
            <span className="text-xs text-muted-foreground">Receive promotional emails</span>
          </Label>
          <Switch
            id="marketingEmails"
            checked={preferences.marketingEmails}
            onCheckedChange={() => handleToggleChange('marketingEmails')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
