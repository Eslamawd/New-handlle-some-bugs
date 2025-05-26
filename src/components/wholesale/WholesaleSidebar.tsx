
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, HomeIcon, Users, LineChart, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarLink from './SidebarLink';
import { useIsMobile } from '@/hooks/use-mobile';

interface WholesaleSidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

const WholesaleSidebar: React.FC<WholesaleSidebarProps> = ({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab,
  handleLogout
}) => {
  const isMobile = useIsMobile();

  // Listen for custom event to close sidebar
  useEffect(() => {
    const handleCustomEvent = () => {
      const event = new CustomEvent('closeSidebar');
      window.dispatchEvent(event);
    };

    // Automatically handle clicks on the document body to close sidebar on mobile
    const handleDocumentClick = (e: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        // Only close if clicking outside the sidebar
        const sidebarElement = document.querySelector('.wholesale-sidebar');
        if (sidebarElement && !sidebarElement.contains(e.target as Node)) {
          handleCustomEvent();
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMobile, sidebarOpen]);

  // Helper function to handle tab selection and mobile sidebar closing
  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      // Close sidebar after selection on mobile
      const event = new CustomEvent('closeSidebar');
      window.dispatchEvent(event);
    }
  };

  return (
    <motion.aside
      initial={{ width: sidebarOpen ? (isMobile ? '100%' : 250) : 0, opacity: sidebarOpen ? 1 : 0 }}
      animate={{ width: sidebarOpen ? (isMobile ? '100%' : 250) : 0, opacity: sidebarOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-16 left-0 z-30 wholesale-sidebar ${isMobile ? 'h-[calc(100vh-64px)] w-full' : 'h-[calc(100vh-64px)] max-w-[250px]'} bg-white border-r shadow-sm overflow-y-auto overflow-x-hidden ${sidebarOpen ? 'block' : 'hidden'}`}
    >
      <div className="p-4">
        <div className="text-lg font-medium mb-6 px-2">Wholesale Portal</div>
        <nav className="space-y-1">
          <SidebarLink 
            href="#" 
            icon={<Package className="h-5 w-5" />} 
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => handleTabSelect('products')} 
          />
          <SidebarLink 
            href="#" 
            icon={<Users className="h-5 w-5" />} 
            label="Customers" 
            active={activeTab === 'customers'} 
            onClick={() => handleTabSelect('customers')} 
          />
          <SidebarLink 
            href="#" 
            icon={<LineChart className="h-5 w-5" />} 
            label="Sales" 
            active={activeTab === 'sales'} 
            onClick={() => handleTabSelect('sales')} 
          />
          <SidebarLink 
            href="#" 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => handleTabSelect('settings')} 
          />
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
};

export default WholesaleSidebar;
