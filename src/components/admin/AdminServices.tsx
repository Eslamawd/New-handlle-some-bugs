import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Pencil, Trash2, GiftIcon, RotateCw, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceType } from "@/lib/types";
import { toast } from "sonner";
import ProductForm from "../admin/customization/ProductForm";
import { 
  loadServices, 
  addService, 
  updateService, 
  deleteService, 
  productToService, 
  initProductManager, 
  PRODUCT_EVENTS,
  loadPricingFromSupabase
} from "@/lib/productManager";
import { supabase } from "@/integrations/supabase/client";

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ServiceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await initProductManager();
      setServices(loadServices());
    };
    
    initialize();
    
    // Listen for service update events
    const handleServiceUpdated = () => {
      setServices(loadServices());
    };
    
    window.addEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, handleServiceUpdated);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_ADDED, handleServiceUpdated);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_DELETED, handleServiceUpdated);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, handleServiceUpdated);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_ADDED, handleServiceUpdated);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_DELETED, handleServiceUpdated);
    };
  }, []);

  const filteredServices = services.filter(service => {
    const matchesTab = activeTab === "all" || service.type === activeTab;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return matchesTab && matchesSearch;
  });

  const handleEditService = async (service: Service) => {
    try {
      // Load pricing data from Supabase if available
      const pricing = await loadPricingFromSupabase(service.id);
      if (pricing.length > 0) {
        service.monthlyPricing = pricing;
        service.availableMonths = pricing.map(p => p.months);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    }
    
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    if (selectedService) {
      deleteService(selectedService.id);
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    }
  };

  const handleAddNewService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: "New Service",
      description: "Service description",
      price: 0,
      wholesalePrice: 0,
      category: "Uncategorized",
      categoryId: "uncategorized",
      image: "/placeholder.svg",
      deliveryTime: "24 hours",
      featured: false,
      type: activeTab === "all" ? "subscription" : activeTab,
    };
    
    setSelectedService(newService);
    setIsDialogOpen(true);
  };

  const handleSaveService = async (updatedProduct: any) => {
    try {
      // Convert Product to Service
      const serviceData = productToService(updatedProduct);
      
      const isNewService = !services.some(service => service.id === serviceData.id);
      
      if (isNewService) {
        await addService(serviceData);
      } else {
        await updateService(serviceData);
      }
      
      setIsDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button onClick={handleAddNewService}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as ServiceType | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
          <TabsTrigger value="topup">Top-ups</TabsTrigger>
          <TabsTrigger value="giftcard">Gift Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="topup" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="giftcard" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService && selectedService.id ? "Edit" : "Add"} Service</DialogTitle>
            <DialogDescription>
              Fill in the details for this service. Different fields will be available based on the service type.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={selectedService ? {
              ...selectedService,
              description: selectedService.description || '',
              category: selectedService.category || selectedService.categoryId || 'Uncategorized',
              image: selectedService.image || '/placeholder.svg'
            } : null}
            onSubmit={handleSaveService} 
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedService?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ServiceList = ({ 
  services, 
  onEdit, 
  onDelete 
}: { 
  services: Service[], 
  onEdit: (service: Service) => void, 
  onDelete: (service: Service) => void 
}) => {
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No services found. Add a new service to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <Card key={service.id} className="overflow-hidden">
          <div className="aspect-video relative bg-gray-100">
            {service.image ? (
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                {service.type === "subscription" && <RotateCw className="h-12 w-12 text-gray-400" />}
                {service.type === "topup" && <Zap className="h-12 w-12 text-gray-400" />}
                {service.type === "giftcard" && <GiftIcon className="h-12 w-12 text-gray-400" />}
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={getBadgeVariant(service.type)}>
                {getServiceTypeName(service.type)}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {service.description}
            </p>
            
            {service.type === "subscription" && service.monthlyPricing && service.monthlyPricing.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                <span className="font-semibold">Available durations:</span>{" "}
                {service.monthlyPricing
                  .sort((a, b) => a.months - b.months)
                  .map(p => `${p.months} month${p.months > 1 ? 's' : ''}`)
                  .join(', ')}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <span className="font-semibold">${service.price.toFixed(2)}</span>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(service)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(service)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getServiceTypeName = (type?: ServiceType): string => {
  switch (type) {
    case "subscription": return "Subscription";
    case "topup": return "Top-up";
    case "giftcard": return "Gift Card";
    case "recharge": return "Recharge";
    case "service": return "Service";
    default: return "Unknown";
  }
};

const getBadgeVariant = (type?: ServiceType): "default" | "secondary" | "outline" => {
  switch (type) {
    case "subscription": return "default";
    case "topup": return "secondary";
    case "giftcard": return "outline";
    default: return "default";
  }
};

export default AdminServices;
