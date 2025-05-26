
import React from 'react';

interface SalesSummaryProps {
  totalOrders: number;
  totalSales: number;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ totalOrders, totalSales }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Sales Summary</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
