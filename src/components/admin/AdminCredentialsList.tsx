
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, PenLine, RefreshCw, Clipboard, Check, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { CredentialStock, Service } from '@/lib/types';

interface AdminCredentialsListProps {
  services?: Service[];
}

const AdminCredentialsList: React.FC<AdminCredentialsListProps> = ({ services }) => {
  const [credentials, setCredentials] = useState<CredentialStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
    
    // Listen for credential added event
    const handleCredentialAdded = () => {
      fetchCredentials();
    };
    
    window.addEventListener('credential-added', handleCredentialAdded);
    
    return () => {
      window.removeEventListener('credential-added', handleCredentialAdded);
    };
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      console.log('Fetching credentials from Supabase...');
      
      const { data, error } = await supabase
        .from('credential_stock')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Fetched credentials:', data);
      
      // Transform the data to match CredentialStock type
      const transformedData: CredentialStock[] = (data || []).map(item => ({
        id: item.id,
        serviceId: item.service_id,
        credentials: typeof item.credentials === 'string' 
          ? JSON.parse(item.credentials) 
          : item.credentials,
        status: item.status as 'available' | 'assigned',
        createdAt: item.created_at,
        orderId: item.order_id,
        userId: item.user_id
      }));
      
      setCredentials(transformedData);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };
  
  const handleDeleteCredential = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credential_stock')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Credential deleted successfully');
      fetchCredentials();
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };
  
  // Filter credentials based on search term
  const filteredCredentials = credentials.filter(credential => 
    credential.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (credential.credentials?.email && credential.credentials.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (credential.credentials?.username && credential.credentials.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Credentials Stock</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchCredentials}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search credentials..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>PIN Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex justify-center items-center py-4">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                      Loading credentials...
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredCredentials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {searchTerm ? 'No credentials found matching your search.' : 'No credentials found.'}
                  </TableCell>
                </TableRow>
              )}
              {filteredCredentials.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell>{credential.serviceId}</TableCell>
                  <TableCell>
                    {credential.credentials?.email ? (
                      <div className="flex items-center">
                        <span className="truncate max-w-[150px]">{credential.credentials.email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6"
                          onClick={() => handleCopyToClipboard(credential.credentials.email, `${credential.id}-email`)}
                        >
                          {copied === `${credential.id}-email` ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {credential.credentials?.password ? (
                      <div className="flex items-center">
                        <span className="truncate max-w-[80px]">••••••••</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6"
                          onClick={() => handleCopyToClipboard(credential.credentials.password, `${credential.id}-password`)}
                        >
                          {copied === `${credential.id}-password` ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {credential.credentials?.pinCode ? (
                      <div className="flex items-center">
                        <span>{credential.credentials.pinCode}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6"
                          onClick={() => handleCopyToClipboard(credential.credentials.pinCode, `${credential.id}-pin`)}
                        >
                          {copied === `${credential.id}-pin` ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        credential.status === "available" ? "secondary" : "default"
                      }
                    >
                      {credential.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteCredential(credential.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCredentialsList;
