
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DarkModeToggle from './DarkModeToggle';

interface MobileActionsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const MobileActions: React.FC<MobileActionsProps> = ({ 
  darkMode, 
  toggleDarkMode, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/96178991908`, '_blank');
  };

  return (
    <div className="md:hidden flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-green-500"
        onClick={handleWhatsAppRedirect}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      
      <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Link to="/checkout">
        <Button variant="ghost" size="icon">
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </Link>
      
      <button 
        className="p-2 rounded-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default MobileActions;
