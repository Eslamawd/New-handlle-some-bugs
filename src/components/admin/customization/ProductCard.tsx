
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from '@/lib/types';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load product image: ${product.image} for ${product.name}`);
    setImageError(true);
    
    // Log this error
    const errorLog = JSON.parse(localStorage.getItem('productImageErrorLog') || '[]');
    errorLog.push({
      productId: product.id,
      productName: product.name,
      imageUrl: product.image,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('productImageErrorLog', JSON.stringify(errorLog));
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer",
        isHovered ? "shadow-md" : "shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover transition-all duration-500",
              imageLoaded ? "opacity-100" : "opacity-0",
              isHovered ? "scale-105" : "scale-100"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            loading="lazy" // Enable lazy loading
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <span className="text-xs text-muted-foreground">No image available</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
            ${product.price}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
        <span>{product.category}</span>
        <span>{product.type || "subscription"}</span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
