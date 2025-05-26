
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { toast } from '@/lib/toast';
import { getSubscriptionStatus } from './utils';

interface StockSubscriptionRowProps {
  subscription: Subscription;
  customerName: string;
  productName: string;
  onRenew?: (subscription: Subscription) => void;
  isRenewed?: boolean;
}

const StockSubscriptionRow: React.FC<StockSubscriptionRowProps> = ({
  subscription,
  customerName,
  productName,
  onRenew,
  isRenewed = false
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { label, variant, icon } = getSubscriptionStatus(subscription);

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

  // Helper function to map variant to one that exists in button variant
  const getBadgeVariant = (variant: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (variant) {
      case "success": return "default";
      case "warning": return "secondary";
      case "destructive": return "destructive";
      default: return "outline";
    }
  };

  return (
    <TableRow key={subscription.id}>
      <TableCell>{productName}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="font-semibold">{customerName}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(variant)}>
          {icon}
          {label}
        </Badge>
      </TableCell>
      <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
      <TableCell>
        {subscription.credentials ? (
          <div className="space-y-1">
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
          <span className="text-muted-foreground text-sm">No credentials</span>
        )}
      </TableCell>

      {onRenew && (
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-primary"
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
        </TableCell>
      )}
    </TableRow>
  );
};

export default StockSubscriptionRow;
