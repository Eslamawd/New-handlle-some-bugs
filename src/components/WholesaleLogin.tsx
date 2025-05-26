
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface WholesaleLoginProps {
  onSuccess: (username: string) => void;
  isLoggedOut?: boolean;
}

const WholesaleLogin: React.FC<WholesaleLoginProps> = ({ onSuccess, isLoggedOut = false }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('wholesaleAuthenticated') === 'true';
    if (isAuthenticated && !isLoggedOut) {
      const username = localStorage.getItem('wholesalerId') || '';
      onSuccess(username);
    }
  }, [onSuccess, isLoggedOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // For demonstration purposes, we'll check for hardcoded credentials
    // and also check against any wholesale users added via admin
    setTimeout(() => {
      // Check for default credentials
      if (username === 'admin' || username === 'wholesaler1') {
        toast({
          title: "Login successful!",
          description: "Welcome to the wholesale portal."
        });
        onSuccess(username);
        return;
      }

      // Get any additional wholesale users added by the admin
      const savedWholesaleUsers = localStorage.getItem('wholesaleUsers');
      if (savedWholesaleUsers) {
        const users = JSON.parse(savedWholesaleUsers);
        const user = users.find((u: any) => u.username === username);
        
        if (user) {
          toast({
            title: "Login successful!",
            description: "Welcome to the wholesale portal."
          });
          onSuccess(username);
          return;
        }
      }

      setError('Invalid username');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Wholesale Login</CardTitle>
        <CardDescription className="text-center">
          {isLoggedOut 
            ? "You've been signed out. Please login again to access the wholesale portal."
            : "Enter your username to access the wholesale portal"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="username" 
                className="pl-10" 
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => window.open(`https://wa.me/96178991908`, '_blank')}
        >
          <MessageCircle className="h-4 w-4 text-green-500" />
          <span>Contact Wholesale Support</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WholesaleLogin;
