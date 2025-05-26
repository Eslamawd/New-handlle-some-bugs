import React, { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar, Zap, Package } from 'lucide-react';
import { Service, ServiceType } from '@/lib/types';

interface ProductSearchProps {
  products: Service[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  products, 
  selectedProductId, 
  onProductSelect 
}) => {
  const [productSearch, setProductSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(productSearch.toLowerCase()));
        
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'subscription') return matchesSearch && product.type === 'subscription';
      if (activeTab === 'recharge') return matchesSearch && (product.type === 'recharge' as ServiceType || product.type === 'topup');
      if (activeTab === 'giftcard') return matchesSearch && (product.type === 'giftcard' as ServiceType || !product.type);
      
      return matchesSearch;
    });
  }, [products, productSearch, activeTab]);

  const productsByCategory = useMemo(() => {
    const categorizedProducts = {} as Record<string, Service[]>;
    
    filteredProducts.forEach(product => {
      const category = product.categoryId || 'Uncategorized';
      if (!categorizedProducts[category]) {
        categorizedProducts[category] = [];
      }
      categorizedProducts[category].push(product);
    });
    
    if (Object.keys(categorizedProducts).length === 0 && products.length > 0) {
      return { 'All Products': products };
    }
    
    return categorizedProducts;
  }, [filteredProducts, products]);

  const renderProductIcon = useCallback((type?: ServiceType) => {
    if (type === 'subscription') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'recharge' as ServiceType || type === 'topup') return <Zap className="h-4 w-4 text-amber-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setProductSearch(value);
    setIsCommandOpen(true);
  }, []);

  const handleSelectProduct = useCallback((productId: string) => {
    console.log("Product selected:", productId);
    onProductSelect(productId);
    setIsCommandOpen(false);
  }, [onProductSelect]);

  const handleFocus = useCallback(() => {
    setIsCommandOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsCommandOpen(false);
    }, 200);
  }, []);

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Service</label>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-2">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
          <TabsTrigger value="recharge">Recharges</TabsTrigger>
          <TabsTrigger value="giftcard">Gift Cards</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-2 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services..."
            className="pl-10"
            value={productSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        
        {isCommandOpen && (
          <Command className="rounded-lg border shadow-md absolute top-full mt-1 w-full z-50 bg-white">
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandInput placeholder="Search services..." value={productSearch} onValueChange={setProductSearch} className="border-none focus:ring-0" />
              <CommandEmpty>No services found. Try a different search term.</CommandEmpty>
              {Object.keys(productsByCategory).length === 0 ? (
                <div className="py-6 text-center text-sm">
                  No services found. Try a different category or search term.
                </div>
              ) : (
                Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                  <CommandGroup key={category} heading={category} className="py-2">
                    {categoryProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelectProduct(product.id)}
                        className={`flex items-center gap-2 cursor-pointer ${selectedProductId === product.id ? 'bg-accent text-accent-foreground' : ''}`}
                      >
                        {renderProductIcon(product.type)}
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">${product.wholesalePrice?.toFixed(2) || product.price.toFixed(2)}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          </Command>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductSearch);
