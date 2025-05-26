
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Import all the components
import Logo from './header/Logo';
import SearchBar from './header/SearchBar';
import NavigationLinks from './header/NavigationLinks';
import MobileActions from './header/MobileActions';
import MobileMenu from './header/MobileMenu';
import DarkModeToggle from './header/DarkModeToggle';
import UserBalance from './header/UserBalance';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const isAdminAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8",
        scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo darkMode={darkMode} />

        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <SearchBar />
        </div>

        <div className="flex items-center">
          <UserBalance />
          
          <div className="hidden md:block">
            <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </div>
          
          <NavigationLinks isAdminAuthenticated={isAdminAuthenticated} />
          
          <MobileActions 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>
      </div>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isAdminAuthenticated={isAdminAuthenticated}
      />
    </header>
  );
};

export default Header;
