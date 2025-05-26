
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Home, 
  User, 
  ShoppingBag, 
  Settings, 
  Briefcase, 
  MessageCircle, 
  LogOut,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose,
  isAdminAuthenticated
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWholesaleAuthenticated, setIsWholesaleAuthenticated] = useState(false);

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
    
    onClose();
    navigate('/login?logout=true');
  };

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/96178991908`, '_blank');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[80vw] sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-2 py-4">
            <div className="space-y-1 mb-4">
              <Link 
                to="/" 
                onClick={onClose}
                className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <Home className="mr-3 h-5 w-5" />
                Home
              </Link>

              <Link 
                to="/checkout" 
                onClick={onClose}
                className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Cart
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <User className="mr-3 h-5 w-5" />
                    Account
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <LogIn className="mr-3 h-5 w-5" />
                    Login
                  </Link>
                  
                  <Link 
                    to="/register" 
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <User className="mr-3 h-5 w-5" />
                    Register
                  </Link>
                </>
              )}
              
              <Link 
                to="/wholesale" 
                onClick={onClose}
                className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <Briefcase className="mr-3 h-5 w-5" />
                Wholesale
              </Link>

              {isAdminAuthenticated && (
                <Link 
                  to="/admin" 
                  onClick={onClose}
                  className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Admin Panel
                </Link>
              )}
            </div>
          </nav>

          <div className="border-t p-4">
            <Button
              variant="outline" 
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleWhatsAppRedirect}
            >
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span>Contact us on WhatsApp</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
