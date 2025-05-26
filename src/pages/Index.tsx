
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { loadProducts, PRODUCT_EVENTS, initProductManager, serviceToProduct } from '@/lib/productManager';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    initProductManager();
    const loadProductData = () => {
      const productData = loadProducts();
      // Ensure all products have the required category property
      const normalizedProducts = productData.map(p => {
        if (!p.category && p.categoryId) {
          return {
            ...p,
            category: p.categoryId
          };
        }
        if (!p.category) {
          return {
            ...p,
            category: 'Uncategorized'
          };
        }
        return p;
      });
      setProducts(normalizedProducts);
    };
    
    loadProductData();
    
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_UPDATED, loadProductData);
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_ADDED, loadProductData);
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_DELETED, loadProductData);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_UPDATED, loadProductData);
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_ADDED, loadProductData);
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_DELETED, loadProductData);
    };
  }, []);
  
  const categories = ['all', ...new Set(products.map(p => p.category.toLowerCase()))];
  
  useEffect(() => {
    let result = [...products];
    
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      result = result.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredProducts(result);
  }, [searchTerm, category, sortBy, products]);
  
  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-6 container mx-auto max-w-7xl">
        <motion.section 
          className="py-16 md:py-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Elevate your space with premium products
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Carefully selected home essentials for the modern lifestyle.
            </motion.p>
          </div>
        </motion.section>
        
        <section className="mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        
        <section className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setCategory('all');
                    setSortBy('default');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={handleProductClick}
                />
              ))
            )}
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Wholesale System</h3>
              <p className="text-muted-foreground">
                Premium products for discerning customers and wholesale partners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/wholesale" className="text-muted-foreground hover:text-primary transition-colors">
                    Wholesale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <p className="text-muted-foreground">
                123 Design Street<br />
                Creativity City, CO 12345<br />
                info@wholesalesystem.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Wholesale System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
