
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;
  
  return (
    <Badge 
      variant="destructive"
      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default NotificationBadge;
