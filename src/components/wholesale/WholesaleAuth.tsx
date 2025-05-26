
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, User, Lock, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// Define demo credentials for wholesale testing
const DEMO_CREDENTIALS = [
  { username: 'wholesaler1', password: 'password123' },
  { username: 'admin', password: 'admin123' }
];

interface WholesaleAuthProps {
  onLoginSuccess?: (username: string, password: string) => Promise<boolean>;
  isLoggedOut?: boolean;
}

const WholesaleAuth: React.FC<WholesaleAuthProps> = ({ onLoginSuccess, isLoggedOut = false }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedWholesaleUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    
    // Check if session still valid
    if (!isLoggedOut) {
      checkExistingSession();
    }
  }, [isLoggedOut]);
  
  const checkExistingSession = async () => {
    // First check localStorage
    const wholesaleAuthenticated = localStorage.getItem("wholesaleAuthenticated");
    const wholesaleAuthExpiry = localStorage.getItem("wholesaleAuthExpires");
    
    if (wholesaleAuthenticated === "true") {
      if (wholesaleAuthExpiry && parseInt(wholesaleAuthExpiry) > Date.now()) {
        // Valid session exists
        const savedWholesalerId = localStorage.getItem('wholesalerId') || "";
        if (savedWholesalerId) {
          navigate('/wholesale');
          return;
        }
      } else {
        // Expired session, clear it
        localStorage.removeItem("wholesaleAuthenticated");
        localStorage.removeItem("wholesaleAuthExpires");
        localStorage.removeItem('wholesalerId');
      }
    }
    
    // Then check sessionStorage
    if (sessionStorage.getItem("wholesaleAuthenticated") === "true") {
      const savedWholesalerId = sessionStorage.getItem('wholesalerId') || "";
      if (savedWholesalerId) {
        navigate('/wholesale');
        return;
      }
    }
    
    // Finally check Supabase session if available
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .maybeSingle();
          
        if (roleData?.role === 'wholesale') {
          if (rememberMe) {
            localStorage.setItem('wholesaleAuthenticated', 'true');
            localStorage.setItem('wholesalerId', data.session.user.id);
            // Set expiration for 7 days
            const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('wholesaleAuthExpires', expiration.toString());
            localStorage.setItem('wholesaleDeviceId', generateDeviceId());
          } else {
            sessionStorage.setItem('wholesaleAuthenticated', 'true');
            sessionStorage.setItem('wholesalerId', data.session.user.id);
            sessionStorage.setItem('wholesaleDeviceId', generateDeviceId());
          }
          navigate('/wholesale');
        }
      }
    } catch (err) {
      console.error("Error checking wholesale authentication:", err);
    }
  };

  // Check if the credentials match the demo accounts
  const checkDemoCredentials = (username: string, password: string): boolean => {
    return DEMO_CREDENTIALS.some(
      demo => demo.username === username && demo.password === password
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!username || !password) {
        toast.error('Please enter both username and password');
        setIsSubmitting(false);
        return;
      }
      
      // First check if the credentials match our demo accounts
      if (checkDemoCredentials(username, password)) {
        console.log('Demo credentials match, logging in');
        
        // Store authentication state for demo users
        if (rememberMe) {
          localStorage.setItem('rememberedWholesaleUsername', username);
          localStorage.setItem('wholesaleAuthenticated', 'true');
          localStorage.setItem('wholesalerId', username);
          
          // Set expiration for 7 days
          const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('wholesaleAuthExpires', expiration.toString());
          localStorage.setItem('wholesaleDeviceId', generateDeviceId());
        } else {
          localStorage.removeItem('rememberedWholesaleUsername');
          sessionStorage.setItem('wholesaleAuthenticated', 'true');
          sessionStorage.setItem('wholesalerId', username);
          sessionStorage.setItem('wholesaleDeviceId', generateDeviceId());
        }
        
        toast.success('Logged in successfully!');
        navigate('/wholesale');
        setIsSubmitting(false);
        return;
      }
      
      // If not demo credentials, try Supabase authentication
      // Try with the username directly
      let authError = true;
      
      // Try both with @wholesaler.com suffix and without
      const emailOptions = [
        username, // Plain username (might be an email already)
        `${username}@wholesaler.com` // Add wholesaler.com suffix
      ];
      
      for (const email of emailOptions) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (!error && data.user) {
          authError = false;
          
          // Check if user has wholesaler role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();
          
          if (roleData?.role === 'wholesale') {
            // Store authentication state
            if (rememberMe) {
              localStorage.setItem('rememberedWholesaleUsername', username);
              localStorage.setItem('wholesaleAuthenticated', 'true');
              localStorage.setItem('wholesalerId', data.user.id);
              
              // Set expiration for 7 days
              const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
              localStorage.setItem('wholesaleAuthExpires', expiration.toString());
              localStorage.setItem('wholesaleDeviceId', generateDeviceId());
            } else {
              localStorage.removeItem('rememberedWholesaleUsername');
              sessionStorage.setItem('wholesaleAuthenticated', 'true');
              sessionStorage.setItem('wholesalerId', data.user.id);
              sessionStorage.setItem('wholesaleDeviceId', generateDeviceId());
            }
            
            toast.success('Logged in successfully!');
            navigate('/wholesale');
            break;
          } else {
            setError('Your account does not have wholesale access');
            toast.error('Your account does not have wholesale access');
          }
        }
      }
      
      // If still having auth error after trying all options
      if (authError) {
        // Fall back to custom auth if provided
        if (onLoginSuccess) {
          const success = await onLoginSuccess(username, password);
          
          if (success) {
            // Store authentication state
            if (rememberMe) {
              localStorage.setItem('rememberedWholesaleUsername', username);
              localStorage.setItem('wholesaleAuthenticated', 'true');
              localStorage.setItem('wholesalerId', username);
              
              // Set expiration for 7 days
              const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
              localStorage.setItem('wholesaleAuthExpires', expiration.toString());
              localStorage.setItem('wholesaleDeviceId', generateDeviceId());
            } else {
              localStorage.removeItem('rememberedWholesaleUsername');
              sessionStorage.setItem('wholesaleAuthenticated', 'true');
              sessionStorage.setItem('wholesalerId', username);
              sessionStorage.setItem('wholesaleDeviceId', generateDeviceId());
            }
            
            navigate('/wholesale');
          } else {
            setError('Invalid username or password');
            toast.error('Invalid username or password');
          }
        } else {
          setError('Invalid username or password');
          toast.error('Invalid username or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      toast.error('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const generateDeviceId = () => {
    // Use existing device ID if already set
    const existingId = localStorage.getItem("deviceId");
    if (existingId) return existingId;
    
    // Generate new device ID based on browser info and random values
    const nav = navigator.userAgent || "";
    const screen = `${window.screen.width}x${window.screen.height}`;
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    
    // Create a device identifier and store it permanently
    const deviceId = btoa(`${nav}-${screen}-${random}-${timestamp}`).substring(0, 36);
    localStorage.setItem("deviceId", deviceId);
    
    return deviceId;
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/96178991908', '_blank');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">
              Wholesale Access
            </CardTitle>
            <CardDescription>
              {isLoggedOut 
                ? "You've been logged out. Please login again to access the wholesale portal."
                : "Enter your credentials to access the wholesale portal"}
            </CardDescription>
            {error && (
              <div className="mt-2 p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(!!checked)} 
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Demo credentials:</div>
              <div className="text-xs bg-slate-100 p-2 rounded-md text-left font-mono">
                Username: wholesaler1<br />
                Password: password123
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have wholesale access?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={openWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  Contact us on WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Please message us at +96178991908 to request wholesale access.
                  Our team will create an account for you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WholesaleAuth;
