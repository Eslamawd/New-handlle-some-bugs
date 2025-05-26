
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

interface LogoProps {
  darkMode: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(true); // Set to true by default to show fallback immediately

  // We'll use the fallback logo from the start and only switch to the image if it loads successfully
  return (
    <Link 
      to="/" 
      className="flex items-center transition-opacity hover:opacity-80"
    >
      <div className="flex items-center">
        <Store className="h-6 w-6 mr-2" />
        <span className="font-bold text-xl">ServexLB</span>
      </div>
    </Link>
  );
};

export default Logo;
