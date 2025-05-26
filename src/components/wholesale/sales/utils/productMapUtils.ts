
// Update the import to use services from our own mock implementation
import { Service } from '@/lib/types';
import { services } from '@/lib/data'; // Use services from data.ts instead of mockData.ts

export const getAllServices = (): Service[] => {
  try {
    // Add additional logging to debug what's happening
    console.log('getAllServices called, services.length:', services.length);
    
    // Convert our services array to the right format
    const formattedServices = services.map(service => ({
      ...service,
      // Ensure required fields for Service type
      id: service.id || `service-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: service.name || 'Unnamed Service',
      type: service.type || 'subscription',
      wholesalePrice: service.wholesalePrice || service.price || 0,
      price: service.price || 0,
      category: service.category || 'Other'
    })) as Service[];
    
    console.log('Formatted services length:', formattedServices.length);
    return formattedServices;
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
};

// Add missing utility functions
export const createServiceMap = (): Map<string, { id: string, name: string, type?: string, price?: number }> => {
  const map = new Map();
  try {
    const servicesList = getAllServices();
    servicesList.forEach(service => {
      map.set(service.id, {
        id: service.id,
        name: service.name,
        type: service.type,
        price: service.price
      });
    });
  } catch (error) {
    console.error('Error creating service map:', error);
  }
  return map;
};

export const getServiceById = (
  productMap: Map<string, { id: string, name: string, type?: string, price?: number }>,
  serviceId?: string
): { id: string, name: string, type?: string, price?: number } | undefined => {
  if (!serviceId) return undefined;
  return productMap.get(serviceId);
};
