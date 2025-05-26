
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/lib/toast";

interface Credentials {
  username?: string;
  password?: string;
  email?: string;
  pinCode?: string;
  [key: string]: any;
}

interface CredentialsDisplayProps {
  credentials?: Credentials;
  title?: string;
  description?: string;
}

const CredentialsDisplay: React.FC<CredentialsDisplayProps> = ({
  credentials,
  title = "Subscription Credentials",
  description = "Login details for this subscription"
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!credentials) {
    return (
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription className="text-xs">No credentials available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      toast.success(`Copied ${field} to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const credentialFields = Object.entries(credentials).filter(
    ([key, value]) => value && typeof value === 'string' && value.length > 0 && key !== 'notes'
  );

  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-2 text-sm">
          {credentialFields.length > 0 ? (
            credentialFields.map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b border-muted last:border-0">
                <dt className="font-medium capitalize">{key}:</dt>
                <div className="flex items-center gap-2">
                  <dd className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</dd>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(value, key)}
                  >
                    {copied === key ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-xs py-2">
              No credential details available
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default CredentialsDisplay;
