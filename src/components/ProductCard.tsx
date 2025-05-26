
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Gift, Zap, Infinity, CreditCard } from "lucide-react";
import { Product, Order } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Get icon based on product type
  const getTypeIcon = () => {
    switch(product.type) {
      case 'subscription':
        return <CreditCard className="h-4 w-4 mr-1" />;
      case 'lifetime':
        return <Infinity className="h-4 w-4 mr-1" />;
      case 'topup':
      case 'recharge':
        return <Zap className="h-4 w-4 mr-1" />;
      case 'giftcard':
        return <Gift className="h-4 w-4 mr-1" />;
      default:
        return <ShoppingCart className="h-4 w-4 mr-1" />;
    }
  };

  // Get price display based on product type
  const getPriceDisplay = () => {
    if (product.type === 'subscription') {
      return `$${product.price.toFixed(2)}/month`;
    } else if (product.type === 'topup' || product.type === 'recharge') {
      return `$${product.price.toFixed(2)} per unit`;
    } else {
      return `$${product.price.toFixed(2)}`;
    }
  };

  return (
    <Card
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="aspect-w-4 aspect-h-3">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="object-cover rounded-t-lg"
          style={{ height: '200px', width: '100%' }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          {product.type && (
            <Badge variant="outline" className="text-xs">
              {product.type}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        
        {product.type === 'subscription' && product.monthlyPricing && product.monthlyPricing.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            <span>Available plans: </span>
            {product.monthlyPricing.map(p => `${p.months} month${p.months > 1 ? 's' : ''}`).join(', ')}
          </div>
        )}
        
        {(product.type === 'topup' || product.type === 'recharge') && product.value && (
          <div className="mt-2 text-xs text-gray-500">
            <span>Value: ${product.value.toFixed(2)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-gray-100">
        <span className="text-md font-bold text-blue-600">{getPriceDisplay()}</span>
        <Button size="sm">
          {getTypeIcon()}
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
