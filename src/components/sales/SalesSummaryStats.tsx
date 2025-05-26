
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import StatsCard from './StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface SalesSummaryStatsProps {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  totalServices?: number;
  wholesalerId?: string;
  isLoading?: boolean;
}

const SalesSummaryStats: React.FC<SalesSummaryStatsProps> = ({
  totalSales: initialTotalSales,
  totalCustomers: initialTotalCustomers,
  totalProducts: initialTotalProducts,
  averageOrderValue: initialAverageOrderValue,
  totalServices: initialTotalServices,
  wholesalerId,
  isLoading: initialIsLoading = false
}) => {
  const [totalSales, setTotalSales] = useState(initialTotalSales);
  const [totalCustomers, setTotalCustomers] = useState(initialTotalCustomers);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [averageOrderValue, setAverageOrderValue] = useState(initialAverageOrderValue);
  const [totalServices, setTotalServices] = useState(initialTotalServices);
  const [isLoading, setIsLoading] = useState(initialIsLoading);

  // Update the component state with props
  useEffect(() => {
    setTotalSales(initialTotalSales);
    setTotalCustomers(initialTotalCustomers);
    setTotalProducts(initialTotalProducts);
    setAverageOrderValue(initialAverageOrderValue);
    setTotalServices(initialTotalServices);
    setIsLoading(initialIsLoading);
  }, [initialTotalSales, initialTotalCustomers, initialTotalProducts, initialAverageOrderValue, initialTotalServices, initialIsLoading]);
  
  // Listen for order and customer events to update metrics in real-time
  useEffect(() => {
    console.log('Setting up event listeners for metrics updates');
    
    const handleOrderPlaced = async () => {
      console.log('Order placed event detected');
      // Always update local state immediately for responsiveness
      setTotalSales(prev => prev + 1);
      
      // Only attempt to fetch from database if we have a valid UUID wholesalerId
      if (wholesalerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wholesalerId)) {
        try {
          const { data, error } = await supabase
            .from('wholesale_metrics')
            .select('*')
            .eq('wholesaler_id', wholesalerId)
            .single();
            
          if (error) {
            console.error('Error fetching updated metrics after order:', error);
          } else if (data) {
            setTotalSales(data.total_sales);
            setAverageOrderValue(data.average_order_value);
            setTotalProducts(data.total_services);
            setTotalServices(data.total_services);
          }
        } catch (error) {
          console.error('Error updating metrics after order:', error);
        }
      }
    };
    
    const handleCustomerAdded = async (event?: Event) => {
      console.log('Customer added event detected in SalesSummaryStats');
      // Always update local state immediately for responsiveness
      setTotalCustomers(prev => prev + 1);
      
      // Only attempt to fetch from database if we have a valid UUID wholesalerId
      if (wholesalerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wholesalerId)) {
        try {
          const { data, error } = await supabase
            .from('wholesale_metrics')
            .select('*')
            .eq('wholesaler_id', wholesalerId)
            .single();
            
          if (error) {
            console.error('Error fetching updated metrics after customer added:', error);
          } else if (data) {
            console.log('Customer count updated from database:', data.total_customers);
            setTotalCustomers(data.total_customers);
          }
        } catch (error) {
          console.error('Error updating metrics after customer added:', error);
        }
      }
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    window.addEventListener('customerAdded', handleCustomerAdded);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, [wholesalerId]);

  // Use totalServices if provided, otherwise fall back to totalProducts
  const displayTotal = totalServices !== undefined ? totalServices : totalProducts;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatsCard
        title="Total Revenue"
        value={`$${totalSales.toFixed(2)}`}
        description="Lifetime sales amount"
        icon={<DollarSign className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Average Order"
        value={`$${averageOrderValue.toFixed(2)}`}
        description="Per transaction"
        icon={<TrendingUp className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Products Sold"
        value={displayTotal.toString()}
        description="Unique products"
        icon={<ShoppingBag className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Customers"
        value={totalCustomers.toString()}
        description="Total customers"
        icon={<Users className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SalesSummaryStats;
