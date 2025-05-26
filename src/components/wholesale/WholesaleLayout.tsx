
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MenuIcon, X, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
import WholesaleSidebar from '@/components/wholesale/WholesaleSidebar';
import ChatBot from '@/components/ChatBot';
import CustomerSearchBar from '@/components/customer/CustomerSearchBar';

interface WholesaleLayoutProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

const WholesaleLayout: React.FC<WholesaleLayoutProps> = ({
  sidebarOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  handleLogout,
  children
}) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Listen for the custom closeSidebar event
  useEffect(() => {
    const handleCloseSidebar = () => {
      if (sidebarOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener('closeSidebar', handleCloseSidebar);
    
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, [sidebarOpen, toggleSidebar]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput instanceof HTMLElement) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  // Handle the search action
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // If we're on the customers tab, we want to filter customers
    // If we're on another tab, we might want different behavior
    console.log("Searching for:", term, "in tab:", activeTab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        <WholesaleSidebar 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
        
        {/* Fixed action buttons for mobile */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 md:hidden">
          <Button 
            size="icon" 
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-md"
            onClick={toggleSearch}
          >
            <Search className="h-6 w-6" />
          </Button>
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-md"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>

        <motion.main
          className={`flex-1 transition-all duration-300 pb-20 ${sidebarOpen && !isMobile ? 'md:ml-[250px]' : ''}`}
          initial={false}
          layout
        >
          {/* Search bar overlay */}
          {showSearch && (
            <div className="fixed inset-0 z-30 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm md:hidden">
              <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Quick Search</h3>
                  <Button variant="ghost" size="sm" onClick={toggleSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CustomerSearchBar 
                  searchTerm={searchTerm} 
                  setSearchTerm={(term) => {
                    setSearchTerm(term);
                    handleSearch(term);
                  }} 
                />
                {searchTerm && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Search results will appear in the current tab
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop search bar */}
          <div className="hidden md:block sticky top-16 z-10 bg-background border-b">
            <div className="container mx-auto max-w-6xl py-2 px-4">
              <div className="flex items-center">
                <div className="w-full max-w-md">
                  <CustomerSearchBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={(term) => {
                      setSearchTerm(term);
                      handleSearch(term);
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-6xl p-4 sm:p-6 pt-6 sm:pt-8">
            {children}
          </div>
        </motion.main>
      </div>
      
      {/* Include ChatBot for wholesale pages too */}
      <ChatBot />
    </div>
  );
};

export default WholesaleLayout;
