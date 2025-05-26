
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Copy, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CredentialDisplayProps {
  orderId: string;
  serviceId: string;
  serviceName: string;
  credentials?: {
    email?: string;
    password?: string;
    username?: string;
    pinCode?: string;
    notes?: string;
  };
  isPending?: boolean;
  purchaseDate?: string;
}

const CredentialDisplay: React.FC<CredentialDisplayProps> = ({
  orderId,
  serviceId,
  serviceName,
  credentials,
  isPending = false,
  purchaseDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCredentials = () => {
    if (!credentials) return;
    
    const credentialText = `
Service: ${serviceName}
${credentials.email ? `Email: ${credentials.email}` : ''}
${credentials.username ? `Username: ${credentials.username}` : ''}
${credentials.password ? `Password: ${credentials.password}` : ''}
${credentials.pinCode ? `PIN: ${credentials.pinCode}` : ''}
${credentials.notes ? `Notes: ${credentials.notes}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(credentialText);
    toast.success("Credentials copied to clipboard");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-sm md:text-base">{serviceName}</h3>
            {purchaseDate && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Purchased: {formatDate(purchaseDate)}</span>
              </div>
            )}
          </div>
          
          {isPending ? (
            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              Pending
            </div>
          ) : credentials ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyCredentials}
              className="h-8"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
          ) : (
            <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Unavailable
            </div>
          )}
        </div>
        
        {credentials && (
          <>
            <div className={`space-y-2 text-sm ${isExpanded ? 'block' : 'hidden'}`}>
              {credentials.email && (
                <div className="grid grid-cols-3">
                  <span className="text-muted-foreground text-xs">Email:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{credentials.email}</span>
                </div>
              )}
              
              {credentials.username && (
                <div className="grid grid-cols-3">
                  <span className="text-muted-foreground text-xs">Username:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{credentials.username}</span>
                </div>
              )}
              
              {credentials.password && (
                <div className="grid grid-cols-3">
                  <span className="text-muted-foreground text-xs">Password:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{credentials.password}</span>
                </div>
              )}
              
              {credentials.pinCode && (
                <div className="grid grid-cols-3">
                  <span className="text-muted-foreground text-xs">PIN:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{credentials.pinCode}</span>
                </div>
              )}
              
              {credentials.notes && (
                <div className="text-xs mt-2">
                  <span className="text-muted-foreground block">Notes:</span>
                  <span className="text-xs mt-1">{credentials.notes}</span>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 w-full text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Details" : "Show Details"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CredentialDisplay;
