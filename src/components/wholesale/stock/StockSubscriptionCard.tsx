
import React, { useState } from 'react';
import { Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/lib/types';
import { toast } from '@/lib/toast';
import { getSubscriptionStatus } from './utils';

interface StockSubscriptionCardProps {
  subscription: Subscription;
  onRenew?: (subscription: Subscription) => void;
  isRenewed?: boolean;
  customerName: string;
  productName: string;
}

const StockSubscriptionCard: React.FC<StockSubscriptionCardProps> = ({
  subscription,
  onRenew,
  isRenewed = false,
  customerName,
  productName
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { label, variant, icon } = getSubscriptionStatus(subscription);

  // Helper function to map variant to one that exists in button variant
  const getBadgeVariant = (variant: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (variant) {
      case "success": return "default";
      case "warning": return "secondary";
      case "destructive": return "destructive";
      default: return "outline";
    }
  };

  const handleCopyToClipboard = (text: string, id: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card key={subscription.id} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {productName}
        </CardTitle>
        <Badge variant={getBadgeVariant(variant)}>
          {icon}
          {label}
        </Badge>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Key className="h-3 w-3" />
            <span className="font-bold">{customerName}</span>
          </div>
        </div>

        {subscription.credentials ? (
          <div className="rounded-md border p-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                Email:
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopyToClipboard(subscription.credentials!.email || "", subscription.id, "Email")}
              >
                {copiedId === subscription.id && copiedField === "Email" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">{subscription.credentials.email}</div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                Password:
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopyToClipboard(subscription.credentials!.password || "", subscription.id, "Password")}
              >
                {copiedId === subscription.id && copiedField === "Password" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">{subscription.credentials.password}</div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No credentials</div>
        )}

        {onRenew && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1 text-primary"
              onClick={() => onRenew(subscription)}
              disabled={isRenewed}
            >
              {isRenewed ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Renewed</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  <span>Renew Account</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSubscriptionCard;
