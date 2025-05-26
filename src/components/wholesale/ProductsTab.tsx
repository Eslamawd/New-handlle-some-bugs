import React, { useState, useEffect } from 'react';
import { Service, Customer, WholesaleOrder } from '@/lib/types';
import PurchaseDialog from './PurchaseDialog';
import ServiceDetails from './ServiceDetails';
import ServiceCard from './ServiceCard';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductsTabProps {
  services: Service[];
  customers: Customer[];
  onOrderPlaced: (order: WholesaleOrder) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ services, customers, onOrderPlaced }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const isMobile = useIsMobile();
  
  const filteredServices = React.useMemo(() => {
    return services.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  const handleServiceClick = (service: Service) => {
    console.log("Service clicked:", service);
    setSelectedService(service);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handlePurchase = (duration?: number) => {
    if (selectedService) {
      console.log("Initiating purchase for service:", selectedService.name, "ID:", selectedService.id);
      setDetailsOpen(false);
      if (duration) {
        setSelectedDuration(duration);
      }
      setPurchaseDialogOpen(true);
    }
  };

  const handleOrderSubmit = (order: WholesaleOrder) => {
    setIsSubmitting(true);
    
    try {
      if (selectedService) {
        console.log("Processing order for service:", selectedService.name, "ID:", selectedService.id);
        order.totalPrice = selectedService.wholesalePrice * (order.quantity || 1);
        order.services = [selectedService.name];
        order.serviceId = selectedService.id;
      }
      
      onOrderPlaced(order);
      
      toast.success('Order placed successfully');
      setPurchaseDialogOpen(false);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    setSelectedService(service);
    setDetailsOpen(true);
  };

  return (
    <div className="h-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <InputWithIcon
            icon={<Search className="h-4 w-4" />}
            placeholder="Search services..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
            className="hidden sm:block"
          >
            Clear
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isMobile={isMobile}
                isWholesale={true}
                onClick={() => handleServiceClick(service)}
                onViewDetails={(e) => handleViewDetails(e, service)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No services found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
          onPurchase={handlePurchase}
        />
      )}
      
      {selectedService && (
        <PurchaseDialog
          onPurchase={handleOrderSubmit}
          isSubmitting={isSubmitting}
          isMobile={isMobile}
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          customers={customers}
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          service={selectedService}
          duration={selectedDuration}
        >
          {null}
        </PurchaseDialog>
      )}
    </div>
  );
};

export default ProductsTab;
