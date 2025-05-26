import { Product, Service, MonthlyPricing, ServiceType } from './types';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// Event names for product changes
export const PRODUCT_EVENTS = {
  PRODUCT_ADDED: 'product-added',
  PRODUCT_UPDATED: 'product-updated',
  PRODUCT_DELETED: 'product-deleted',
  SERVICE_ADDED: 'service-added',
  SERVICE_UPDATED: 'service-updated',
  SERVICE_DELETED: 'service-deleted',
};

// Utility function to convert Service to Product
export const serviceToProduct = (service: Service): Product => {
  return {
    id: service.id,
    name: service.name,
    description: service.description || "",
    price: service.price,
    wholesalePrice: service.wholesalePrice,
    image: service.image,
    category: service.category || service.categoryId || 'Uncategorized',
    categoryId: service.categoryId || service.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    featured: service.featured,
    type: service.type,
    value: service.value,
    deliveryTime: service.deliveryTime,
    availableMonths: service.availableMonths,
    apiUrl: service.apiUrl,
    minQuantity: service.minQuantity,
    requiresId: service.requiresId,
    monthlyPricing: service.monthlyPricing || [],
    features: service.features || [],
    availableForCustomers: service.availableForCustomers !== undefined ? service.availableForCustomers : true
  };
};

// Utility function to convert Product to Service
export const productToService = (product: Product): Service => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    wholesalePrice: product.wholesalePrice || 0,
    image: product.image,
    categoryId: product.categoryId || product.category.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    category: product.category,
    featured: product.featured || false,
    type: product.type || 'subscription',
    deliveryTime: product.deliveryTime || '',
    availableMonths: product.availableMonths,
    apiUrl: product.apiUrl,
    minQuantity: product.minQuantity,
    requiresId: product.requiresId,
    value: product.value,
    monthlyPricing: product.monthlyPricing || [],
    features: product.features || [],
    availableForCustomers: product.availableForCustomers
  };
};

// Save products to localStorage and optionally to Supabase
export const saveProducts = async (products: Product[]): Promise<void> => {
  // Save to localStorage
  localStorage.setItem('products', JSON.stringify(products));
  
  // Dispatch event
  dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_UPDATED, products);
  
  // Optional: Save to Supabase if connected
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      // We have an authenticated session, could sync with Supabase here
      // This would be implemented based on your specific data model
    }
  } catch (error) {
    console.error('Error checking Supabase session:', error);
  }
};

// Save services to localStorage and optionally to Supabase
export const saveServices = async (services: Service[]): Promise<void> => {
  // Save to localStorage
  localStorage.setItem('services', JSON.stringify(services));
  
  // Dispatch event
  dispatchProductEvent(PRODUCT_EVENTS.SERVICE_UPDATED, services);
  
  // Optional: Save to Supabase if connected
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      // We have an authenticated session, could sync with Supabase here
      // This would be implemented based on your specific data model
    }
  } catch (error) {
    console.error('Error checking Supabase session:', error);
  }
};

// Load products from localStorage
export const loadProducts = (): Product[] => {
  const storedProducts = localStorage.getItem('products');
  return storedProducts ? JSON.parse(storedProducts) : [];
};

// Load services from localStorage
export const loadServices = (): Service[] => {
  const storedServices = localStorage.getItem('services');
  return storedServices ? JSON.parse(storedServices) : [];
};

// Add a new product and sync with services
export const addProduct = async (product: Product): Promise<void> => {
  const products = loadProducts();
  products.push(product);
  await saveProducts(products);
  
  // Sync with services
  const service = productToService(product);
  const services = loadServices();
  services.push(service);
  await saveServices(services);
  
  // Save pricing to Supabase if available
  if (product.monthlyPricing && product.monthlyPricing.length > 0) {
    await savePricingToSupabase(product.id, product.monthlyPricing);
  }
  
  toast.success(`${product.name} added to the product catalog`);
  dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_ADDED, product);
};

// Add a new service and sync with products
export const addService = async (service: Service): Promise<void> => {
  const services = loadServices();
  services.push(service);
  await saveServices(services);
  
  // Sync with products
  const product = serviceToProduct(service);
  const products = loadProducts();
  products.push(product);
  await saveProducts(products);
  
  // Save pricing to Supabase if available
  if (service.monthlyPricing && service.monthlyPricing.length > 0) {
    await savePricingToSupabase(service.id, service.monthlyPricing);
  }
  
  toast.success(`${service.name} added to the service catalog`);
  dispatchProductEvent(PRODUCT_EVENTS.SERVICE_ADDED, service);
};

// Update a product and sync with services
export const updateProduct = async (updatedProduct: Product): Promise<void> => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  
  if (index !== -1) {
    products[index] = updatedProduct;
    await saveProducts(products);
    
    // Sync with services
    const services = loadServices();
    const serviceIndex = services.findIndex(s => s.id === updatedProduct.id);
    
    if (serviceIndex !== -1) {
      services[serviceIndex] = productToService(updatedProduct);
    } else {
      services.push(productToService(updatedProduct));
    }
    
    await saveServices(services);
    
    // Save pricing to Supabase if available
    if (updatedProduct.monthlyPricing && updatedProduct.monthlyPricing.length > 0) {
      await savePricingToSupabase(updatedProduct.id, updatedProduct.monthlyPricing);
    }
    
    toast.success(`${updatedProduct.name} updated successfully`);
    dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_UPDATED, updatedProduct);
  }
};

// Update a service and sync with products
export const updateService = async (updatedService: Service): Promise<void> => {
  const services = loadServices();
  const index = services.findIndex(s => s.id === updatedService.id);
  
  if (index !== -1) {
    services[index] = updatedService;
    await saveServices(services);
    
    // Sync with products
    const products = loadProducts();
    const productIndex = products.findIndex(p => p.id === updatedService.id);
    
    if (productIndex !== -1) {
      products[productIndex] = serviceToProduct(updatedService);
    } else {
      products.push(serviceToProduct(updatedService));
    }
    
    await saveProducts(products);
    
    // Save pricing to Supabase if available
    if (updatedService.monthlyPricing && updatedService.monthlyPricing.length > 0) {
      await savePricingToSupabase(updatedService.id, updatedService.monthlyPricing);
    }
    
    toast.success(`${updatedService.name} updated successfully`);
    dispatchProductEvent(PRODUCT_EVENTS.SERVICE_UPDATED, updatedService);
  }
};

// Delete a product and sync with services
export const deleteProduct = async (productId: string): Promise<void> => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index !== -1) {
    const deletedProduct = products[index];
    products.splice(index, 1);
    await saveProducts(products);
    
    // Sync with services
    const services = loadServices();
    const serviceIndex = services.findIndex(s => s.id === productId);
    
    if (serviceIndex !== -1) {
      services.splice(serviceIndex, 1);
      await saveServices(services);
    }
    
    // Delete pricing from Supabase
    await deletePricingFromSupabase(productId);
    
    toast.success(`${deletedProduct.name} removed from catalog`);
    dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_DELETED, deletedProduct);
  }
};

// Delete a service and sync with products
export const deleteService = async (serviceId: string): Promise<void> => {
  const services = loadServices();
  const index = services.findIndex(s => s.id === serviceId);
  
  if (index !== -1) {
    const deletedService = services[index];
    services.splice(index, 1);
    await saveServices(services);
    
    // Sync with products
    const products = loadProducts();
    const productIndex = products.findIndex(p => p.id === serviceId);
    
    if (productIndex !== -1) {
      products.splice(productIndex, 1);
      await saveProducts(products);
    }
    
    // Delete pricing from Supabase
    await deletePricingFromSupabase(serviceId);
    
    toast.success(`${deletedService.name} removed from catalog`);
    dispatchProductEvent(PRODUCT_EVENTS.SERVICE_DELETED, deletedService);
  }
};

// Calculate monthly price based on monthly pricing or base price
export const getMonthlyPrice = (
  product: Product | Service, 
  months: number, 
  isWholesale: boolean = false
): number => {
  if (!product.monthlyPricing || (product.monthlyPricing as MonthlyPricing[]).length === 0) {
    // If no monthly pricing, use the base price * months
    return isWholesale 
      ? (product.wholesalePrice || 0) * months
      : (product.price || 0) * months;
  }
  
  // Find the exact match for the months
  const exactMatch = (product.monthlyPricing as MonthlyPricing[]).find(p => p.months === months);
  if (exactMatch) {
    return isWholesale ? exactMatch.wholesalePrice : exactMatch.price;
  }
  
  // If no exact match, use the base price * months as fallback
  return isWholesale 
    ? (product.wholesalePrice || 0) * months
    : (product.price || 0) * months;
};

// Dispatch custom events for product changes
const dispatchProductEvent = (eventName: string, data: any): void => {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (e) {
    console.error(`Error dispatching ${eventName} event:`, e);
  }
};

// Helper functions for Supabase pricing data
export const savePricingToSupabase = async (serviceId: string, pricing: MonthlyPricing[]): Promise<void> => {
  try {
    // Check if we have a Supabase session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;
    
    // Delete existing pricing for this service
    await supabase
      .from('service_pricing')
      .delete()
      .eq('service_id', serviceId);
    
    // Insert new pricing data
    if (pricing.length > 0) {
      const pricingData = pricing.map(p => ({
        service_id: serviceId,
        duration_months: p.months,
        price: p.price,
        wholesale_price: p.wholesalePrice || 0
      }));
      
      const { error } = await supabase
        .from('service_pricing')
        .insert(pricingData);
        
      if (error) {
        console.error('Error saving pricing to Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error in Supabase pricing operations:', error);
  }
};

export const loadPricingFromSupabase = async (serviceId: string): Promise<MonthlyPricing[]> => {
  try {
    // Check if we have a Supabase session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return [];
    
    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('service_id', serviceId);
      
    if (error) {
      console.error('Error loading pricing from Supabase:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        months: item.duration_months,
        price: item.price,
        wholesalePrice: item.wholesale_price,
        savings: 0 // Calculate if needed
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error in Supabase pricing query:', error);
    return [];
  }
};

export const deletePricingFromSupabase = async (serviceId: string): Promise<void> => {
  try {
    // Check if we have a Supabase session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;
    
    const { error } = await supabase
      .from('service_pricing')
      .delete()
      .eq('service_id', serviceId);
      
    if (error) {
      console.error('Error deleting pricing from Supabase:', error);
    }
  } catch (error) {
    console.error('Error in Supabase pricing deletion:', error);
  }
};

// Initialize the product manager (sync products and services on load)
export const initProductManager = async (): Promise<void> => {
  const products = loadProducts();
  const services = loadServices();
  
  // If we have products but no services, convert products to services
  if (products.length > 0 && services.length === 0) {
    const convertedServices = products.map(productToService);
    await saveServices(convertedServices);
  }
  
  // If we have services but no products, convert services to products
  if (services.length > 0 && products.length === 0) {
    const convertedProducts = services.map(serviceToProduct);
    await saveProducts(convertedProducts);
  }
  
  console.log(`Product manager initialized: ${products.length} products, ${services.length} services`);
  
  // Try to load pricing data from Supabase for all services
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      const { data: pricingData, error } = await supabase
        .from('service_pricing')
        .select('*');
        
      if (error) {
        console.error('Error loading pricing data from Supabase:', error);
      } else if (pricingData && pricingData.length > 0) {
        // Update services and products with pricing data
        for (const service of services) {
          const servicePricing = pricingData.filter(p => p.service_id === service.id);
          if (servicePricing.length > 0) {
            service.monthlyPricing = servicePricing.map(p => ({
              months: p.duration_months,
              price: p.price,
              wholesalePrice: p.wholesale_price,
              savings: 0
            }));
            service.availableMonths = service.monthlyPricing.map(p => p.months);
          }
        }
        
        // Also update products
        for (const product of products) {
          const productPricing = pricingData.filter(p => p.service_id === product.id);
          if (productPricing.length > 0) {
            product.monthlyPricing = productPricing.map(p => ({
              months: p.duration_months,
              price: p.price,
              wholesalePrice: p.wholesale_price,
              savings: 0
            }));
            product.availableMonths = product.monthlyPricing.map(p => p.months);
          }
        }
        
        // Save updated data
        await saveServices(services);
        await saveProducts(products);
      }
    }
  } catch (error) {
    console.error('Error initializing product manager with Supabase data:', error);
  }
};
