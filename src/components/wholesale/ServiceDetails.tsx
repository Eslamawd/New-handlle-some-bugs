
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Service } from '@/lib/types';
import { CheckCircle, Calendar, Clock, Tag, ShoppingCart, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

export interface ServiceDetailsProps {
  service: Service;
  onClose: () => void;
  onPurchase: (duration?: number) => void;
  isOpen?: boolean;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ 
  service, 
  onClose,
  onPurchase,
  isOpen = true
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const isSubscription = service.type === 'subscription';
  
  // Define available durations - either from service or default options
  const availableDurations = service.availableMonths || [1, 3, 6, 12];
  
  const handlePurchase = () => {
    console.log("Purchase initiated from details for service:", service.name, "ID:", service.id);
    onPurchase(isSubscription ? parseInt(selectedDuration) : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {service.image && (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={service.image} 
              alt={service.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{service.name}</DialogTitle>
            <DialogDescription>
              {service.description || 'No description available'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-1">
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  Price
                </h4>
                <p className="text-lg font-semibold">${service.wholesalePrice.toFixed(2)}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Type
                </h4>
                <p className="text-lg">{service.type || 'N/A'}</p>
              </div>
              
              {service.deliveryTime && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Delivery Time
                  </h4>
                  <p className="text-lg">{service.deliveryTime}</p>
                </div>
              )}
              
              {isSubscription && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Subscription
                  </h4>
                  <p className="text-lg">Monthly service</p>
                </div>
              )}
            </div>
            
            {/* Add duration selection for subscription services */}
            {isSubscription && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <Label htmlFor="duration" className="text-sm font-medium mb-2 block">Subscription Duration</Label>
                <Select
                  value={selectedDuration}
                  onValueChange={setSelectedDuration}
                >
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDurations.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month} {month === 1 ? 'month' : 'months'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {service.features && service.features.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Service Features</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              className="flex-1 sm:flex-none gap-2"
              variant="default"
            >
              <ShoppingCart className="h-4 w-4" />
              {isSubscription ? `Purchase for Customer (${selectedDuration} ${parseInt(selectedDuration) === 1 ? 'month' : 'months'})` : 'Purchase for Customer'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetails;
