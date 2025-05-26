
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MonthlySalesChart from './sales/charts/MonthlySalesChart';
import SalesDistributionChart from './sales/charts/SalesDistributionChart';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface SalesCalculatorProps {
  orders?: WholesaleOrder[];
  customers?: Customer[];
  wholesalerId?: string;
}

const SalesCalculator: React.FC<SalesCalculatorProps> = ({
  orders = [],
  customers = [],
  wholesalerId
}) => {
  // Calculate real stats from the orders data
  const {
    totalSales,
    totalCustomers,
    totalServices,
    averageOrderValue,
    salesByCustomer,
    salesByService,
    monthlySalesData
  } = useMemo(() => {
    // Initialize default values
    const result = {
      totalSales: 0,
      totalCustomers: 0,
      totalServices: 0,
      averageOrderValue: 0,
      salesByCustomer: [] as { name: string; value: number }[],
      salesByService: [] as { name: string; value: number }[],
      monthlySalesData: [] as { month: string; total: number }[]
    };

    if (!orders.length) {
      // Initialize monthly data with all zeros when no orders exist
      const months: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
        months[monthName] = 0;
      }
      
      result.monthlySalesData = Object.entries(months).map(([month, total]) => ({
        month,
        total
      }));
      
      return result;
    }

    // Calculate total sales
    result.totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Calculate unique customers count
    const uniqueCustomers = new Set(orders.map(order => order.customerId).filter(Boolean));
    result.totalCustomers = uniqueCustomers.size;

    // Calculate unique services count
    const uniqueServices = new Set(orders.map(order => order.serviceId).filter(Boolean));
    result.totalServices = uniqueServices.size;

    // Calculate average order value
    result.averageOrderValue = result.totalSales / orders.length;

    // Calculate sales by customer
    const customerSales = new Map<string, number>();
    orders.forEach(order => {
      if (order.customerId) {
        const currentTotal = customerSales.get(order.customerId) || 0;
        customerSales.set(order.customerId, currentTotal + order.totalPrice);
      }
    });

    // Convert map to array and add customer names
    const customerSalesArray: { name: string; value: number }[] = [];
    customerSales.forEach((value, customerId) => {
      const customer = customers?.find(c => c.id === customerId);
      if (customer) {
        customerSalesArray.push({
          name: customer.name,
          value
        });
      }
    });

    // Sort by value and take top 5
    result.salesByCustomer = customerSalesArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate sales by service
    const serviceSales = new Map<string, number>();
    orders.forEach(order => {
      if (order.serviceId) {
        const currentTotal = serviceSales.get(order.serviceId) || 0;
        serviceSales.set(order.serviceId, currentTotal + order.totalPrice);
      }
    });

    // Convert map to array and use service IDs as names for now
    const serviceSalesArray: { name: string; value: number }[] = [];
    serviceSales.forEach((value, serviceId) => {
      serviceSalesArray.push({
        name: serviceId,
        value
      });
    });

    // Sort by value and take top 5
    result.salesByService = serviceSalesArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate monthly sales data
    const monthlySales: Record<string, number> = {};
    // Initialize all months with zero
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      monthlySales[monthName] = 0;
    }

    // Add actual sales data
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const monthName = date.toLocaleString('default', { month: 'short' });
        monthlySales[monthName] = (monthlySales[monthName] || 0) + order.totalPrice;
      }
    });

    // Convert to array format for chart
    result.monthlySalesData = Object.entries(monthlySales).map(([month, total]) => ({
      month,
      total
    }));

    return result;
  }, [orders, customers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlySalesChart monthlySalesData={monthlySalesData} />
        <SalesDistributionChart 
          salesByCustomer={salesByCustomer} 
          salesByProduct={salesByService} // Renamed from salesByService to salesByProduct
        />
      </div>
    </motion.div>
  );
};

export default SalesCalculator;
