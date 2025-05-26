
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service } from '@/lib/types';
import { PlusCircle, Info, ShoppingCart } from "lucide-react";
import { cn } from '@/lib/utils';

export interface ServiceCardProps {
  service: Service;
  isWholesale?: boolean;
  isMobile: boolean;
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isWholesale = false,
  isMobile,
  onClick,
  onViewDetails
}) => {
  const formatPrice = (price: number) => {
    return isWholesale
      ? `$${service.wholesalePrice?.toFixed(2) || '0.00'}`
      : `$${service.price?.toFixed(2) || '0.00'}`;
  };

  const getServiceTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'subscription':
        return 'Subscription';
      case 'one-time':
        return 'One-Time Purchase';
      case 'recharge':
        return 'Recharge';
      case 'topup':
        return 'Top-up';
      case 'lifetime':
        return 'Lifetime';
      case 'giftcard':
        return 'Gift Card';
      default:
        return 'Service';
    }
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Purchase clicked for service:", service.name, "ID:", service.id);
    onClick();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 h-full flex flex-col",
        "hover:shadow-md cursor-pointer"
      )}
      onClick={onClick}
    >
      {service.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={service.image} 
            alt={service.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{service.name}</CardTitle>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {getServiceTypeLabel(service.type)}
          </span>
          <span className="font-medium">
            {formatPrice(isWholesale ? (service.wholesalePrice || 0) : service.price)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description || 'No description available'}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={onViewDetails}
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          Details
        </Button>
        
        <Button 
          size="sm" 
          className="text-xs" 
          onClick={handlePurchaseClick}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
          {isMobile ? 'Buy' : 'Purchase for Customer'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
