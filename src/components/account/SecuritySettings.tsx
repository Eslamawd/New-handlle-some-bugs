
import React, { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface SecuritySettingsProps {
  userId: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userId }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    // For a real app, you would make an API call here
    // For this demo, we'll just show a success message
    toast.success("Password changed successfully");
    
    // Reset form
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handle2FAToggle = () => {
    // For a real app, you would implement proper 2FA setup
    toast.success("2FA settings updated");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          
          <Button type="submit">Update Password</Button>
        </form>
        
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Two-Factor Authentication</h3>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
            <Button variant="outline" size="sm" onClick={handle2FAToggle}>
              Enable 2FA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
