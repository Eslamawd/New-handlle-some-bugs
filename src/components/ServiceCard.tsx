
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PurchaseDialog from '@/components/PurchaseDialog';
import { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  isMobile: boolean;
  isWholesale?: boolean;
  onClick?: () => void;
  onViewDetails?: (e: React.MouseEvent) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isMobile, 
  isWholesale = false,
  onClick,
  onViewDetails
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [stockAvailable, setStockAvailable] = useState(true);

  // In the purchase function, add code to check for stock availability and assign credentials
  const handlePurchase = async () => {
    if (!service) return;
    
    // For services that use credentials, check stock availability
    if (service.type === 'subscription') {
      const { checkStockAvailability } = await import('@/lib/credentialService');
      const isStockAvailable = await checkStockAvailability(service.id);
      
      if (!isStockAvailable) {
        // Set flag to show "pending" status in the purchase success dialog
        setStockAvailable(false);
      }
    }
    
    if (onClick) {
      onClick();
    } else {
      setShowDialog(true);
    }
  };

  return (
    <>
      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Price:</span>
            <span>{formatCurrency(isWholesale ? service.wholesalePrice : service.price)}</span>
          </div>
          
          {service.deliveryTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Delivery Time:</span>
              <span>{service.deliveryTime}</span>
            </div>
          )}
          
          {service.features && service.features.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm font-medium">Features:</span>
              <ul className="list-disc pl-4">
                {service.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          {service.status === 'active' ? (
            <Badge variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Active
            </Badge>
          ) : (
            <Badge variant="destructive">
              <Circle className="mr-2 h-4 w-4" />
              Inactive
            </Badge>
          )}
          
          <div className="flex gap-2">
            {onViewDetails && (
              <Button variant="outline" onClick={onViewDetails}>
                Details
              </Button>
            )}
            <Button onClick={handlePurchase}>
              Purchase
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {!onClick && (
        <PurchaseDialog
          service={service}
          quantity={1}
          duration={1}
          open={showDialog}
          onOpenChange={setShowDialog}
          onPurchase={() => setShowDialog(false)}
        />
      )}
    </>
  );
};

export default ServiceCard;
