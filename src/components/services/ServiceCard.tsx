import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Info, Check, Clock, Star, Gift, Zap, Infinity, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import PurchaseDialog from '@/components/PurchaseDialog';
import { supabase } from '@/integrations/supabase/client';
import { externalApi } from '@/lib/externalApi';

interface ServiceCardProps {
  service: Service;
  isWholesale?: boolean;
  onClick?: () => void;
  onViewDetails?: (e: React.MouseEvent) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isWholesale = false,
  onClick,
  onViewDetails
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      addItem(service);
      
      if (user) {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
          const { error } = await supabase
            .from('cart_items')
            .upsert({
              user_id: session.session.user.id,
              service_id: service.id,
              service_name: service.name,
              quantity: 1,
              price: service.price,
              added_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,service_id'
            });
          
          if (error) {
            console.error('Error saving cart item:', error);
          }
        }
      }
      
      toast.success('Added to cart', {
        description: `${service.name} added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart', {
        description: 'There was a problem adding this item to your cart',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    if (onViewDetails) {
      onViewDetails(e);
    }
  };

  const getTypeIcon = () => {
    switch(service.type) {
      case 'subscription':
        return <CreditCard className="h-3 w-3 mr-1" />;
      case 'one-time':
        return <ShoppingCart className="h-3 w-3 mr-1" />;
      case 'lifetime':
        return <Infinity className="h-3 w-3 mr-1" />;
      case 'topup':
      case 'recharge':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'giftcard':
        return <Gift className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getPriceDisplay = () => {
    if (service.type === 'subscription') {
      return `${isWholesale 
        ? formatCurrency(service.wholesalePrice || service.price)
        : formatCurrency(service.price)}/month`;
    } else if (service.type === 'topup' || service.type === 'recharge') {
      return `${isWholesale 
        ? formatCurrency(service.wholesalePrice || service.price)
        : formatCurrency(service.price)} per unit`;
    } else {
      return isWholesale 
        ? formatCurrency(service.wholesalePrice || service.price)
        : formatCurrency(service.price);
    }
  };

  const showPurchaseConfirmation = async () => {
    setQuantity(1);
    setDuration(1);
    
    if ((service.type === 'topup' || service.type === 'recharge') && service.useExternalApi) {
      try {
        const stockResult = await externalApi.getCredentials(service.id);
        
        if (!stockResult.available) {
          toast.error("Service Unavailable", {
            description: "This service is currently unavailable. Please try again later."
          });
          return;
        }
      } catch (error) {
        console.error('Error checking service availability:', error);
        toast.warning("Limited Availability", {
          description: "This service may have limited availability. Proceed with caution."
        });
      }
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handlePurchase = () => {
    setIsConfirmDialogOpen(false);
    toast.success('Purchase completed', {
      description: `Your purchase of ${service.name} was successful`,
    });
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{service.name}</CardTitle>
          {service.featured && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
        {service.type && (
          <Badge variant="outline" className="mt-1 flex items-center">
            {getTypeIcon()}
            {service.type === 'subscription' ? 'Subscription' : 
             service.type === 'one-time' ? 'One-time' : 
             service.type === 'lifetime' ? 'Lifetime' : 
             service.type === 'topup' ? 'Top-up' :
             service.type === 'recharge' ? 'Recharge' :
             service.type === 'giftcard' ? 'Gift Card' :
             service.type}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="px-4 py-2 flex-grow">
        <div className="relative aspect-video w-full mb-3 bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={service.image || '/placeholder.svg'} 
            alt={service.name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {service.description || 'No description available'}
        </p>
        
        {service.deliveryTime && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>Delivery: {service.deliveryTime}</span>
          </div>
        )}
        
        {service.type === 'subscription' && service.monthlyPricing && service.monthlyPricing.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            <span>Available durations: </span>
            <span className="font-medium">
              {service.monthlyPricing.map(p => `${p.months} month${p.months > 1 ? 's' : ''}`).join(', ')}
            </span>
          </div>
        )}
        
        {(service.type === 'topup' || service.type === 'recharge') && service.value && (
          <div className="text-xs text-muted-foreground mb-2">
            <span>Value: </span>
            <span className="font-medium">${service.value.toFixed(2)}</span>
          </div>
        )}
        
        {service.minQuantity && service.minQuantity > 1 && (
          <div className="text-xs text-muted-foreground mb-2">
            <span>Min quantity: </span>
            <span className="font-medium">{service.minQuantity}</span>
          </div>
        )}
        
        <div className="mt-auto">
          <div className="flex justify-between items-baseline">
            <div className="font-semibold text-lg">
              {getPriceDisplay()}
            </div>
            {isWholesale && (
              <div className="text-xs text-muted-foreground">
                Retail: {service.type === 'subscription' 
                  ? `${formatCurrency(service.price)}/month` 
                  : formatCurrency(service.price)}
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-3"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              showPurchaseConfirmation();
            }}
            disabled={isPurchasing}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy Now
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 pt-0 flex gap-2">
        <Button 
          className="flex-1"
          size="sm"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
            </>
          )}
        </Button>
        
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewDetailsClick}
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
      
      <PurchaseDialog
        service={service}
        quantity={quantity}
        duration={duration}
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onPurchase={handlePurchase}
      />
    </Card>
  );
};

export default ServiceCard;
