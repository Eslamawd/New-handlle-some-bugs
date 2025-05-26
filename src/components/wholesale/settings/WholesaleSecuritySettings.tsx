
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { Eye, EyeOff, Lock, Shield, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const WholesaleSecuritySettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [recoveryCodesDisplayed, setRecoveryCodesDisplayed] = useState(false);
  const [confirmDisable2FA, setConfirmDisable2FA] = useState(false);
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load 2FA status on component mount
  useEffect(() => {
    const stored2FAStatus = localStorage.getItem('wholesaler2FAEnabled');
    if (stored2FAStatus) {
      setIs2FAEnabled(stored2FAStatus === 'true');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
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
    
    // For this demo, we'll just show a success message
    toast.success("Password changed successfully");
    
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const generateSecret = () => {
    // In a real app, this would be generated on the server
    // For demo, we'll create a random string
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateQRCode = (secret: string) => {
    // In a real app, this would be a proper QR code
    // For this demo, we'll just return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Servexlb:${localStorage.getItem('wholesalerUsername')}?secret=${secret}&issuer=Servexlb`;
  };

  const generateBackupCodes = () => {
    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + 
      '-' + 
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setBackupCodes(codes);
    return codes;
  };

  const handle2FAToggle = () => {
    if (is2FAEnabled) {
      setConfirmDisable2FA(true);
    } else {
      const secret = generateSecret();
      localStorage.setItem('wholesaler2FASecret', secret);
      setShow2FADialog(true);
      setVerificationStep('setup');
      // Generate backup codes
      const codes = generateBackupCodes();
      localStorage.setItem('wholesaler2FABackupCodes', JSON.stringify(codes));
    }
  };

  const verifyCode = () => {
    // In a real app, this would verify against the actual TOTP algorithm
    // For this demo, we'll accept any 6-digit code
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      if (verificationStep === 'setup') {
        setVerificationStep('backup');
      } else if (verificationStep === 'verify') {
        disableConfirmed();
      }
    } else {
      toast.error("Invalid verification code. Please try again.");
    }
  };

  const completeSetup = () => {
    if (!savedBackupCodes) {
      toast.error("Please confirm that you have saved your backup codes");
      return;
    }
    setIs2FAEnabled(true);
    localStorage.setItem('wholesaler2FAEnabled', 'true');
    setShow2FADialog(false);
    setVerificationCode('');
    setVerificationStep('setup');
    setSavedBackupCodes(false);
    toast.success("Two-factor authentication enabled successfully");
  };

  const handleSessionClear = () => {
    toast.success("All other sessions have been logged out");
  };

  const disableConfirmed = () => {
    setIs2FAEnabled(false);
    localStorage.removeItem('wholesaler2FAEnabled');
    localStorage.removeItem('wholesaler2FASecret');
    localStorage.removeItem('wholesaler2FABackupCodes');
    setConfirmDisable2FA(false);
    setVerificationCode('');
    toast.success("Two-factor authentication has been disabled");
  };

  const cancelDisable = () => {
    setConfirmDisable2FA(false);
    setVerificationCode('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-medium">Change Password</h3>
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
      
      <div className="border-t my-6 pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Security Options</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled 
                  ? "Your account is protected with two-factor authentication" 
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
            <Button 
              variant={is2FAEnabled ? "destructive" : "outline"} 
              size="sm" 
              onClick={handle2FAToggle}
            >
              {is2FAEnabled ? (
                "Disable 2FA"
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
          
          {is2FAEnabled && (
            <div className="rounded-md bg-muted p-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-green-100 p-1 rounded-full dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Two-factor authentication is enabled</h5>
                  <p className="text-xs text-muted-foreground">Your account has an extra layer of security.</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs mt-1" 
                    onClick={() => {
                      setShow2FADialog(true);
                      setVerificationStep('backup');
                      const storedCodes = localStorage.getItem('wholesaler2FABackupCodes');
                      if (storedCodes) {
                        setBackupCodes(JSON.parse(storedCodes));
                      } else {
                        const codes = generateBackupCodes();
                        localStorage.setItem('wholesaler2FABackupCodes', JSON.stringify(codes));
                      }
                      setRecoveryCodesDisplayed(true);
                    }}
                  >
                    View recovery codes
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">Log out from all devices except this one</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSessionClear}>
              Log Out Other Devices
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/80 mb-4">
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => toast.error("Account deletion requires admin approval. Please contact support.")}
            >
              Delete Account
            </Button>
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => toast.success("Your data has been downloaded.")}
            >
              Export My Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verificationStep === 'setup' && "Set up two-factor authentication"}
              {verificationStep === 'backup' && "Save your recovery codes"}
              {verificationStep === 'verify' && "Verify your identity"}
            </DialogTitle>
            <DialogDescription>
              {verificationStep === 'setup' && "Scan the QR code with your authenticator app to setup 2FA"}
              {verificationStep === 'backup' && "Save these recovery codes in a safe place to regain access if you lose your device"}
              {verificationStep === 'verify' && "Enter the 6-digit code from your authenticator app"}
            </DialogDescription>
          </DialogHeader>

          {verificationStep === 'setup' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-3 rounded-md mb-2">
                <img 
                  src={generateQRCode(localStorage.getItem('wholesaler2FASecret') || '')} 
                  alt="QR Code for 2FA" 
                  className="w-[200px] h-[200px]"
                />
              </div>
              
              <div className="text-sm text-center">
                <p className="font-medium mb-1">Can't scan the QR code?</p>
                <p className="text-muted-foreground mb-2">Enter this code manually in your app:</p>
                <code className="bg-muted p-2 rounded text-xs">
                  {localStorage.getItem('wholesaler2FASecret')}
                </code>
              </div>
              
              <div className="w-full space-y-2">
                <Label htmlFor="verification-code">Enter verification code from your app</Label>
                <InputOTP 
                  maxLength={6} 
                  value={verificationCode} 
                  onChange={setVerificationCode}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} index={index} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
            </div>
          )}

          {verificationStep === 'backup' && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md overflow-x-auto">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-background p-1 text-xs rounded flex justify-between items-center">
                      <span>{code}</span>
                      <span className="text-muted-foreground">{index + 1}/10</span>
                    </code>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-center">
                <p className="text-muted-foreground">
                  You can use these codes to sign in if you lose access to your authenticator app.
                  Each code can only be used once.
                </p>
              </div>
              
              <Textarea 
                readOnly 
                value={backupCodes.join('\n')} 
                className="text-xs font-mono" 
                rows={10} 
              />
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="confirm-save" 
                  checked={savedBackupCodes} 
                  onCheckedChange={(checked) => setSavedBackupCodes(!!checked)} 
                />
                <Label 
                  htmlFor="confirm-save" 
                  className="text-sm leading-tight"
                >
                  I have saved these recovery codes in a safe place
                </Label>
              </div>
            </div>
          )}

          {verificationStep === 'verify' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-2">
                Please enter the 6-digit code from your authenticator app to verify your identity
              </div>
              
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
          )}

          <DialogFooter>
            {verificationStep === 'setup' && (
              <Button type="button" onClick={verifyCode}>
                Verify
              </Button>
            )}
            
            {verificationStep === 'backup' && (
              <Button 
                type="button" 
                onClick={completeSetup} 
                disabled={!savedBackupCodes}
              >
                Complete Setup
              </Button>
            )}
            
            {verificationStep === 'verify' && (
              <Button type="button" onClick={verifyCode}>
                Verify
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Confirmation Dialog */}
      <Dialog open={confirmDisable2FA} onOpenChange={setConfirmDisable2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              This will remove the additional security from your account. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 inline-block mr-2" />
              <span>Disabling 2FA will make your account less secure.</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code to confirm</Label>
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={cancelDisable} className="sm:mb-0 mb-2">
              Cancel
            </Button>
            <Button variant="destructive" onClick={verifyCode}>
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WholesaleSecuritySettings;
