
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Subscription, Service } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { CopyIcon, CheckIcon } from 'lucide-react';

interface CustomerCredentialsProps {
  subscription?: Subscription;
  service?: Service;
}

const CustomerCredentials: React.FC<CustomerCredentialsProps> = ({ subscription, service }) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCredentials();
  }, [subscription]);

  const fetchCredentials = async () => {
    if (!user || !subscription) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try to get credentials from subscription first
      if (subscription.credentials) {
        setCredentials(subscription.credentials);
        setLoading(false);
        return;
      }

      // Try to get from credential_stock if there's a reference
      if (subscription.credentialStockId) {
        const { data, error } = await supabase
          .from('credential_stock')
          .select('credentials')
          .eq('id', subscription.credentialStockId)
          .single();

        if (error) {
          console.error('Error fetching credential stock:', error);
        } else if (data) {
          setCredentials(data.credentials);
        }
      } else {
        // Fallback - look for any assigned credentials for this subscription
        const { data, error } = await supabase
          .from('credential_stock')
          .select('credentials')
          .eq('service_id', subscription.serviceId)
          .eq('user_id', user.id)
          .eq('status', 'assigned')
          .single();

        if (error) {
          console.error('Error fetching assigned credentials:', error);
        } else if (data) {
          setCredentials(data.credentials);
        }
      }
    } catch (error) {
      console.error('Error in fetchCredentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  const handleCopyAll = () => {
    if (!credentials) return;
    
    const credText = Object.entries(credentials)
      .filter(([key, value]) => value && key !== 'notes')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(credText).then(() => {
      toast.success('All credentials copied to clipboard');
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Credentials</CardTitle>
          <CardDescription>Loading your access credentials...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Credentials</CardTitle>
          <CardDescription>Credentials for your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {subscription?.status === 'pending' ? (
              <p>Your credentials are pending. We'll notify you when they're ready.</p>
            ) : (
              <p>No credentials found for this subscription.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Credentials</CardTitle>
        <CardDescription>
          Access credentials for {service?.name || 'your subscription'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(credentials)
            .filter(([key, value]) => value && key !== 'notes')
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{key}</p>
                  <p className="text-sm text-muted-foreground font-mono">{value as string}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleCopyText(key, value as string)}
                >
                  {copied[key] ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            ))}

          {credentials.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{credentials.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopyAll} className="w-full">
          Copy All Credentials
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerCredentials;
