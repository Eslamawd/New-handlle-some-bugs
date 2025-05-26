
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface CustomerSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-3 flex items-center pl-2 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search products, customers, orders..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pl-9 pr-9 w-full"
        autoComplete="off"
      />
      {searchTerm && (
        <button
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default CustomerSearchBar;
