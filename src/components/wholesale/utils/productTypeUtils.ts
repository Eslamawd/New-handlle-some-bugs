
import { Product } from '@/lib/data';
import { Service } from '@/lib/types';

/**
 * Converts a service object to a product object with the correct type
 */
export const serviceToProduct = (service: Service): Product => {
  return {
    id: service.id,
    name: service.name,
    description: service.description || '',
    price: service.price,
    wholesalePrice: service.wholesalePrice || service.price * 0.7,
    image: service.image || '/placeholder.svg',
    category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
    featured: service.featured || false,
    type: "service" as "service",
    deliveryTime: service.deliveryTime || "",
    apiUrl: service.apiUrl,
    availableMonths: service.availableMonths,
    value: service.value,
  };
};

/**
 * Ensures a product has the correct type property
 */
export const normalizeProductType = (product: Product): Product => {
  return {
    ...product,
    type: product.type || "subscription" as "subscription"
  };
};
