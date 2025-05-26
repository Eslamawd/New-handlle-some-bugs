
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Settings, User, ShoppingBag, MessageCircle, LogOut, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface NavigationLinksProps {
  isAdminAuthenticated: boolean;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ isAdminAuthenticated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWholesaleAuthenticated, setIsWholesaleAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('currentUserId');
      const wholesalerAuth = localStorage.getItem('wholesaleAuthenticated');
      
      setIsAuthenticated(!!(userId));
      setIsWholesaleAuthenticated(wholesalerAuth === 'true');
    };

    checkAuth();
    
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/96178991908`, '_blank');
  };

  const handleLogout = () => {
    const userId = localStorage.getItem('currentUserId');
    
    localStorage.removeItem('currentUserId');
    
    if (userId) {
      localStorage.removeItem(`userBalance_${userId}`);
      localStorage.removeItem(`userProfile_${userId}`);
      localStorage.removeItem(`transactionHistory_${userId}`);
      localStorage.removeItem(`customerOrders_${userId}`);
    }
    
    // Trigger global logout event for other parts of the app (including wholesale)
    window.dispatchEvent(new Event('globalLogout'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast({
      description: "You have been signed out successfully.",
    });
    
    navigate('/login?logout=true');
  };

  return (
    <nav className="hidden md:flex items-center space-x-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-green-500 hover:text-white hover:bg-green-500"
        onClick={handleWhatsAppRedirect}
        title="Contact us on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      
      {isWholesaleAuthenticated ? (
        <>
          <Link to="/wholesale">
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <Briefcase className="h-4 w-4" />
              <span>Wholesale Portal</span>
            </Button>
          </Link>
        </>
      ) : (
        <Link to="/wholesale">
          <Button variant="outline" size="sm" className="flex gap-2 items-center">
            <Briefcase className="h-4 w-4" />
            <span>Wholesale</span>
          </Button>
        </Link>
      )}
      
      {isAdminAuthenticated ? (
        <Link to="/admin">
          <Button variant="outline" size="sm" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </Link>
      ) : null}
      
      {isAuthenticated ? (
        <>
          <Link to="/account">
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <User className="h-4 w-4" />
              <span>Account</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-2 items-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
          
          <Link to="/register">
            <Button variant="outline" size="sm">Register</Button>
          </Link>
        </>
      )}
      
      <Link to="/checkout">
        <Button variant="default" size="sm" className="flex gap-2 items-center">
          <ShoppingBag className="h-4 w-4" />
          <span>Cart</span>
        </Button>
      </Link>
    </nav>
  );
};

export default NavigationLinks;
