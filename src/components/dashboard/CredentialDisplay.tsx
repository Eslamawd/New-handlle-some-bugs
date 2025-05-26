
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subscription, Service } from '@/lib/types';
import { EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NoDataMessage from '../ui/NoDataMessage';

interface CredentialDisplayProps {
  subscriptions: Subscription[];
  services: Service[];
}

const CredentialDisplay: React.FC<CredentialDisplayProps> = ({ subscriptions, services }) => {
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const subscriptionsWithCredentials = subscriptions.filter(sub => 
    sub.credentials && 
    (sub.credentials.email || 
     sub.credentials.username || 
     sub.credentials.password ||
     sub.credentials.pinCode)
  );

  if (subscriptionsWithCredentials.length === 0) {
    return (
      <NoDataMessage
        title="No credentials found"
        description="You don't have any stored credentials for your subscriptions."
        icon={<EyeOff className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  const toggleCredentialVisibility = (id: string) => {
    setVisibleCredentials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subscriptionsWithCredentials.map(subscription => {
        const service = services.find(s => s.id === subscription.serviceId);
        const isVisible = visibleCredentials[subscription.id] || false;
        
        return (
          <Card key={subscription.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{service?.name || 'Unknown Service'}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {subscription.credentials?.email && (
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">Email:</div>
                    <div className="flex items-center">
                      <div className="font-mono text-sm mr-2">
                        {isVisible ? subscription.credentials.email : '••••••••••••'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(subscription.credentials?.email || '', `${subscription.id}-email`)}
                      >
                        {copiedField === `${subscription.id}-email` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {subscription.credentials?.username && (
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">Username:</div>
                    <div className="flex items-center">
                      <div className="font-mono text-sm mr-2">
                        {isVisible ? subscription.credentials.username : '••••••••••••'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(subscription.credentials?.username || '', `${subscription.id}-username`)}
                      >
                        {copiedField === `${subscription.id}-username` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {subscription.credentials?.password && (
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">Password:</div>
                    <div className="flex items-center">
                      <div className="font-mono text-sm mr-2">
                        {isVisible ? subscription.credentials.password : '••••••••••••'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(subscription.credentials?.password || '', `${subscription.id}-password`)}
                      >
                        {copiedField === `${subscription.id}-password` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {subscription.credentials?.pinCode && (
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">PIN:</div>
                    <div className="flex items-center">
                      <div className="font-mono text-sm mr-2">
                        {isVisible ? subscription.credentials.pinCode : '••••••••••••'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(subscription.credentials?.pinCode || '', `${subscription.id}-pin`)}
                      >
                        {copiedField === `${subscription.id}-pin` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCredentialVisibility(subscription.id)}
                  >
                    {isVisible ? 'Hide Credentials' : 'Show Credentials'}
                  </Button>
                </div>
                
                {subscription.credentials?.notes && (
                  <div className="pt-2 border-t mt-2">
                    <div className="font-medium text-sm mb-1">Notes:</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {subscription.credentials.notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CredentialDisplay;
