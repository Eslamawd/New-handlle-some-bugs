
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleAlert, CircleX, Clock } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  statusColor: "green" | "orange" | "destructive";
  label?: string;
}

export const getSubscriptionStatusColor = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);
  const daysLeft = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return "destructive";
  if (daysLeft === 0) return "destructive";
  if (daysLeft <= 3) return "orange"; 
  return "green";
};

export const getStatusLabel = (statusColor: string, daysLeft?: number) => {
  if (statusColor === "green") return "Active";
  if (statusColor === "orange") return daysLeft !== undefined ? `Expiring in ${daysLeft} days` : "Expiring Soon";
  return "Expired";
};

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ 
  statusColor, 
  label 
}) => {
  return (
    <Badge 
      variant={
        statusColor === "green" ? "default" : 
        statusColor === "orange" ? "outline" : 
        "destructive"
      }
      className={
        statusColor === "orange" 
          ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
          : ""
      }
    >
      {statusColor === "green" && <Clock className="h-3 w-3 mr-1" />}
      {statusColor === "orange" && <CircleAlert className="h-3 w-3 mr-1" />}
      {statusColor === "destructive" && <CircleX className="h-3 w-3 mr-1" />}
      {label || getStatusLabel(statusColor)}
    </Badge>
  );
};

export default SubscriptionStatusBadge;
