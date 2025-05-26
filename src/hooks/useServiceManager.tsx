
import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export const useServiceManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadServices = useCallback(() => {
    try {
      // First try to get from localStorage
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices) as Service[];
        setServices(parsedServices);
        return parsedServices;
      }
      return [];
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Since the services table doesn't exist in Supabase, we'll use local storage
      // and display a message if no services are found
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices) as Service[];
        setServices(parsedServices);
      } else {
        // Create some default services if none exist
        const defaultServices: Service[] = [
          {
            id: 'service-1',
            name: 'Basic Subscription',
            description: 'Monthly basic service subscription',
            price: 9.99,
            wholesalePrice: 7.99,
            type: 'subscription',
            image: 'https://images.unsplash.com/photo-1563770660941-10a63110472a?auto=format&fit=crop&w=300&q=80',
            availableMonths: [1, 3, 6, 12],
            features: ['Basic access', '720p streaming', '1 device']
          },
          {
            id: 'service-2',
            name: 'Premium Subscription',
            description: 'Monthly premium service with additional features',
            price: 19.99,
            wholesalePrice: 15.99,
            type: 'subscription',
            image: 'https://images.unsplash.com/photo-1586892478381-237bd8da4c85?auto=format&fit=crop&w=300&q=80',
            availableMonths: [1, 3, 6, 12],
            features: ['Premium access', '4K streaming', '4 devices']
          }
        ];
        
        localStorage.setItem('services', JSON.stringify(defaultServices));
        setServices(defaultServices);
      }
    } catch (error) {
      console.error('Error in fetchServices:', error);
      toast.error('Error loading services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addService = useCallback(async (service: Omit<Service, 'id'>) => {
    try {
      // Generate a temporary ID
      const tempId = `service-${Date.now()}`;
      
      // Create the service with the full data structure
      const newService: Service = {
        ...service,
        id: tempId
      };
      
      // Add to local state first
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-added'));
      
      toast.success('Service added successfully');
      return newService;
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
      return null;
    }
  }, [services]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      const serviceIndex = services.findIndex(s => s.id === id);
      if (serviceIndex === -1) {
        toast.error('Service not found');
        return false;
      }
      
      // Update the service
      const updatedService = {
        ...services[serviceIndex],
        ...updates
      };
      
      const updatedServices = [
        ...services.slice(0, serviceIndex),
        updatedService,
        ...services.slice(serviceIndex + 1)
      ];
      
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-updated'));
      
      toast.success('Service updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      return false;
    }
  }, [services]);

  const deleteService = useCallback(async (id: string) => {
    try {
      const filteredServices = services.filter(s => s.id !== id);
      setServices(filteredServices);
      localStorage.setItem('services', JSON.stringify(filteredServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-deleted'));
      
      toast.success('Service deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      return false;
    }
  }, [services]);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    isLoading,
    loadServices,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
};
