import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleLogin } from '@react-oauth/google';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [wasLoggedOut, setWasLoggedOut] = useState(false);
  
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    if (!isAuthenticated) {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    const logoutParam = new URLSearchParams(location.search).get('logout');
    if (logoutParam === 'true') {
      setWasLoggedOut(true);
    }
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (loginError) {
        console.error("Login error:", loginError);
        setError(loginError.message || "Invalid email or password. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      if (data?.user) {
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An unexpected error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResetSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link");
        console.error('Error sending reset email:', error);
        setResetSubmitting(false);
        return;
      }

      setResetSent(true);
      
      setTimeout(() => {
        setShowResetDialog(false);
        setResetSent(false);
        setResetEmail("");
      }, 3000);
      
      toast.success("Reset link sent to your email");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setResetSubmitting(false);
    }
  };

  function onGoogleLoginSuccess(credentialResponse: any) {
    console.log("Google login successful:", credentialResponse);
    setOauthError(null);
    
    toast.info("Google login will be available soon.");
  }

  function onGoogleLoginError() {
    console.error("Google sign-in failed");
    setOauthError(
      "Google sign-in failed. This is likely because your app domain is not authorized in your Google OAuth Client settings."
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex justify-center items-center py-12 px-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              {wasLoggedOut 
                ? "You've been signed out successfully. Sign in again to continue."
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-2">
                <Info className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {oauthError && (
              <Alert className="mb-4 border-amber-500 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <Info className="h-4 w-4" />
                <AlertDescription className="flex flex-col gap-2">
                  <p>{oauthError}</p>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline">Google Cloud Console</a></li>
                    <li>Select your OAuth 2.0 Client ID</li>
                    <li>Add your app domain to the Authorized JavaScript origins</li>
                    <li>Add redirect URIs if needed (e.g., https://yourdomain.com/login)</li>
                    <li>Save changes and wait a few minutes for them to propagate</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleLoginSuccess}
                onError={onGoogleLoginError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
              />
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">or continue with email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </Label>
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto" 
                      onClick={() => setShowResetDialog(true)}
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {resetSent ? (
              <Alert className="border-green-500 text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/20">
                <AlertDescription>
                  Password reset link has been sent to your email.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input 
                  id="resetEmail" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowResetDialog(false)}
              disabled={resetSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={resetSubmitting || resetSent}
            >
              {resetSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Login;
