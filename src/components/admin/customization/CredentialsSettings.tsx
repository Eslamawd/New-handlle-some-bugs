
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Check } from "lucide-react";

const CredentialsSettings = () => {
  const [requireCredentials, setRequireCredentials] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load the current setting from localStorage
    const savedSetting = localStorage.getItem("requireSubscriptionCredentials");
    if (savedSetting !== null) {
      setRequireCredentials(savedSetting === "true");
    }
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setRequireCredentials(checked);
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Save the setting to localStorage
    localStorage.setItem("requireSubscriptionCredentials", requireCredentials.toString());
    setHasChanges(false);
    
    // Dispatch a custom event to inform other components of the change
    window.dispatchEvent(new CustomEvent('credential-setting-changed', { 
      detail: { requireCredentials } 
    }));
    
    toast.success("Credential settings saved successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Credentials</CardTitle>
        <CardDescription>
          Control whether to request email and password when purchasing subscription services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Require credentials</h3>
            <p className="text-sm text-muted-foreground">
              When enabled, customers and wholesalers will be asked to provide email and password
              information when purchasing subscription services
            </p>
          </div>
          <Switch 
            checked={requireCredentials} 
            onCheckedChange={handleToggleChange}
          />
        </div>

        {hasChanges && (
          <Button onClick={saveSettings} className="w-full sm:w-auto">
            <Check className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CredentialsSettings;
