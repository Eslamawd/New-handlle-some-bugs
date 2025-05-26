
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Product, getProductById, products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, CreditCard } from 'lucide-react';
import { toast } from '@/lib/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1");
  
  useEffect(() => {
    if (id) {
      // Simulate API loading
      setLoading(true);
      setTimeout(() => {
        const foundProduct = getProductById(id);
        setProduct(foundProduct || null);
        setLoading(false);
      }, 500);
    }
  }, [id]);
  
  const handleAddToCart = () => {
    toast.success(`Added to cart`, {
      description: `${quantity} × ${product?.name}`,
      action: {
        label: 'View Cart',
        onClick: () => console.log('View cart'),
      },
    });
  };

  const showPurchaseConfirmation = () => {
    // Reset fields when opening dialog
    setAccountId('');
    setIsConfirmDialogOpen(true);
  };
  
  const handleBuyNow = () => {
    if (product?.type === 'recharge' && !accountId.trim()) {
      toast.error("Account ID required", {
        description: "Please enter your account ID for this purchase"
      });
      return;
    }
    
    setIsPurchasing(true);
    
    // Simulate purchase processing
    setTimeout(() => {
      toast.success(`Purchase successful!`, {
        description: `${isSubscription ? selectedDuration + ' months of' : quantity + ' ×'} ${product?.name} has been purchased`,
      });
      setIsPurchasing(false);
      setIsConfirmDialogOpen(false);
    }, 1000);
  };
  
  const increaseQuantity = () => {
    setQuantity(q => q + 1);
  };
  
  const decreaseQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(1); // Reset to 1 if input is cleared
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 container mx-auto max-w-7xl flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 container mx-auto max-w-7xl flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Shop
            </Link>
          </Button>
        </main>
      </div>
    );
  }
  
  const isSubscription = product.type === 'subscription';
  const isGiftCard = product.type === 'giftcard';
  const isRecharge = product.type === 'recharge';
  
  // Helper to determine if product should use months feature
  const shouldUseMonths = isSubscription || 
    product.category.toLowerCase().includes('streaming') || 
    product.category.toLowerCase().includes('vpn') || 
    product.category.toLowerCase().includes('security') ||
    product.category.toLowerCase().includes('productivity');

  const getQuantityLabel = () => {
    if (shouldUseMonths) {
      return 'Duration';
    } else {
      return 'Quantity';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-6 container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-lg shadow-sm">
          <motion.div 
            className="relative overflow-hidden rounded-lg bg-muted aspect-square"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`absolute inset-0 bg-gray-100 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`} />
            <img 
              src={product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover object-center ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
          
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-2">
              <span className="inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
            
            <div className="mt-2 mb-6">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {isSubscription && <span className="text-sm text-muted-foreground ml-1">/month</span>}
            </div>
            
            <div className="prose prose-sm mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>
            
            <div className="mt-auto space-y-6">
              {isSubscription ? (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Subscription Duration
                  </label>
                  <Select 
                    value={selectedDuration}
                    onValueChange={setSelectedDuration}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={quantity <= 1}
                    onClick={decreaseQuantity}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity.toString()}
                    onChange={handleQuantityChange}
                    className="mx-2 w-16 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-2 text-sm text-muted-foreground">{getQuantityLabel()}</span>
                </div>
              )}
              
              {isSubscription && (
                <div className="text-sm text-muted-foreground">
                  Duration: {selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={showPurchaseConfirmation}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
              
              <div className="border-t pt-6 flex items-center text-sm text-muted-foreground">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                In stock & ready to ship
              </div>
            </div>
          </motion.div>
        </div>
        
        <section className="my-20">
          <h2 className="text-2xl font-semibold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.filter(p => p.id !== product.id).slice(0, 3).map(relatedProduct => (
              <div key={relatedProduct.id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover-lift">
                <Link to={`/products/${relatedProduct.id}`}>
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {relatedProduct.category}
                    </span>
                    <h3 className="mt-1 text-lg font-medium">{relatedProduct.name}</h3>
                    <p className="mt-2 font-semibold">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
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
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/wholesale" className="text-muted-foreground hover:text-primary transition-colors">
                    Wholesale
                  </Link>
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
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Please review your order details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Product:</span>
              <span>{product?.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price per {isSubscription ? 'month' : 'unit'}:</span>
              <span className="font-bold">${product?.price.toFixed(2)}</span>
            </div>
            
            {isSubscription ? (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Subscription Duration <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedDuration}
                  onValueChange={setSelectedDuration}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{getQuantityLabel()}:</span>
                <div className="flex items-center">
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-r-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity.toString()}
                    onChange={handleQuantityChange}
                    className="h-8 rounded-none border-x-0 w-16 px-0 text-center"
                  />
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-l-none"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            {isRecharge && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Account ID <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Enter your account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This ID is required to process your recharge
                </p>
              </div>
            )}
            
            {isGiftCard && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Gift Card Value:</span>
                <span>${product?.value?.toFixed(2) || product?.price.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold">
                ${(isSubscription ? product?.price! * parseInt(selectedDuration) : product?.price! * quantity).toFixed(2)}
              </span>
            </div>
            
            {product?.deliveryTime && (
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Estimated Delivery:</span>
                <span>{product?.deliveryTime}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuyNow} disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
