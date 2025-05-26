
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendUp,
  isLoading = false
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none text-muted-foreground">
              {title}
            </p>
            <div className="flex items-center">
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              {trend && (
                <span className={`ml-2 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {trend}
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="rounded-full bg-muted p-2 text-primary-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
