
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useWholesaleSidebar() {
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Close sidebar on mobile by default
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    // Event listener for closing sidebar from child components
    const handleCloseSidebar = () => {
      if (isMobile) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('closeSidebar', handleCloseSidebar);
    
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar
  };
}
