
import React from 'react';
import { Label } from "@/components/ui/label";

interface ServiceDisplayProps {
  serviceName: string;
}

const ServiceDisplay: React.FC<ServiceDisplayProps> = ({ serviceName }) => {
  if (!serviceName) return null;
  
  return (
    <div className="grid gap-2">
      <Label>Service</Label>
      <div className="p-2 bg-muted rounded-md">
        {serviceName}
      </div>
    </div>
  );
};

export default ServiceDisplay;
