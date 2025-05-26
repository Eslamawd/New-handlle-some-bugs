
import React, { useEffect, useState } from 'react';
import SalesCalculator from '@/components/SalesCalculator';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import SalesSummaryStats from '@/components/sales/SalesSummaryStats';
import { toast } from '@/lib/toast';

interface SalesTabProps {
  orders: WholesaleOrder[];
  customers: Customer[];
  wholesalerId?: string;
}

const SalesTab: React.FC<SalesTabProps> = ({ 
  orders, 
  customers,
  wholesalerId 
}) => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(customers.length || 0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Update metrics when props change
  useEffect(() => {
    // Calculate totals from props
    if (customers && customers.length !== totalCustomers) {
      setTotalCustomers(customers.length);
    }

    if (orders && orders.length > 0) {
      calculateOrderMetrics(orders);
    }
  }, [customers, orders]);

  // Fetch metrics from Supabase on component mount
  useEffect(() => {
    if (!wholesalerId) return;
    
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Validate wholesalerId is a proper UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wholesalerId)) {
          console.error('Invalid UUID format for wholesaler_id:', wholesalerId);
          calculateFromCurrentData();
          return;
        }
        
        const { data, error } = await supabase
          .from('wholesale_metrics')
          .select('*')
          .eq('wholesaler_id', wholesalerId)
          .single();
          
        if (error) {
          console.error('Error fetching metrics:', error);
          // Don't show toast for not found error as it might be first time user
          if (error.code !== 'PGRST116') {
            toast.error('Error loading metrics');
          }
          calculateFromCurrentData();
        } else if (data) {
          console.log('Metrics loaded from Supabase:', data);
          setTotalSales(data.total_sales || 0);
          setTotalCustomers(data.total_customers || customers.length || 0);
          setTotalProducts(data.total_services || 0);
          setAverageOrderValue(data.average_order_value || 0);
        } else {
          calculateFromCurrentData();
        }
      } catch (error) {
        console.error('Error in fetchMetrics:', error);
        calculateFromCurrentData();
      } finally {
        setIsLoading(false);
      }
    };
    
    const calculateFromCurrentData = () => {
      if (customers) {
        setTotalCustomers(customers.length);
      }
      
      if (orders && orders.length > 0) {
        calculateOrderMetrics(orders);
      } else {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
    
    // Listen for customer added events
    const handleCustomerAdded = () => {
      console.log('Customer added event detected');
      if (wholesalerId) {
        fetchMetrics();
      } else {
        setTotalCustomers(prev => prev + 1);
      }
    };
    
    window.addEventListener('customerAdded', handleCustomerAdded);
    
    return () => {
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, [wholesalerId]);

  const calculateOrderMetrics = (orders: WholesaleOrder[]) => {
    const total = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    setTotalSales(total);
    
    const productSet = new Set();
    orders.forEach(order => order.serviceId && productSet.add(order.serviceId));
    setTotalProducts(productSet.size);
    
    setAverageOrderValue(orders.length > 0 ? total / orders.length : 0);
  };

  // Update local metrics in Supabase
  const updateMetrics = async () => {
    if (!wholesalerId) return;
    
    // Validate wholesalerId is a proper UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wholesalerId)) {
      console.error('Invalid UUID format for wholesaler_id:', wholesalerId);
      return;
    }
    
    try {
      const metricsData = {
        total_sales: totalSales,
        total_customers: totalCustomers,
        total_services: totalProducts,
        average_order_value: averageOrderValue
      };
      
      const { error } = await supabase
        .from('wholesale_metrics')
        .upsert({
          wholesaler_id: wholesalerId,
          ...metricsData
        });
        
      if (error) {
        console.error('Error updating metrics:', error);
      }
    } catch (error) {
      console.error('Error in updateMetrics:', error);
    }
  };

  // Update metrics when component unmounts
  useEffect(() => {
    return () => {
      if (wholesalerId) {
        updateMetrics();
      }
    };
  }, [totalSales, totalCustomers, totalProducts, averageOrderValue, wholesalerId]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Sales Dashboard</h2>
      
      <SalesSummaryStats
        totalSales={totalSales}
        totalCustomers={totalCustomers}
        totalProducts={totalProducts}
        averageOrderValue={averageOrderValue}
        wholesalerId={wholesalerId}
        isLoading={isLoading}
      />
      
      <SalesCalculator 
        orders={orders} 
        customers={customers}
        wholesalerId={wholesalerId}
      />
    </div>
  );
};

export default SalesTab;
