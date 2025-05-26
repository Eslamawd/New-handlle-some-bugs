
import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TotalPriceDisplayProps {
  totalPrice: number;
}

const TotalPriceDisplay: React.FC<TotalPriceDisplayProps> = ({ totalPrice }) => {
  return (
    <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <span className="font-medium">Total Price:</span>
      </div>
      <span className="text-xl font-bold text-primary">
        {formatCurrency(totalPrice)}
      </span>
    </div>
  );
};

export default TotalPriceDisplay;
