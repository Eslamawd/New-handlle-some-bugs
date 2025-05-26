
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, FileText, ArrowUp } from "lucide-react";
import AdminCredentialsList from './AdminCredentialsList';
import { Service } from '@/lib/types';
import { addCredentialToStock } from '@/lib/credentialService';
import AdminStockIssues from './AdminStockIssues';
import CsvUploader from './CsvUploader';
import { toast } from '@/lib/toast';
import { useServiceManager } from '@/hooks/useServiceManager';

const CredentialManager: React.FC<{services: Service[]}> = ({ services }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedService, setSelectedService] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('add-single');
  const { loadServices } = useServiceManager();
  
  useEffect(() => {
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
      try {
        const parsedServices = JSON.parse(storedServices) as Service[];
      } catch (error) {
        console.error('Error parsing services from localStorage', error);
      }
    } else {
      // If no services in localStorage, try to load them
      loadServices();
    }
    
    // Listen for service updates
    const handleServiceUpdate = () => {
      loadServices();
    };
    
    window.addEventListener('service-updated', handleServiceUpdate);
    window.addEventListener('service-added', handleServiceUpdate);
    window.addEventListener('service-deleted', handleServiceUpdate);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdate);
      window.removeEventListener('service-added', handleServiceUpdate);
      window.removeEventListener('service-deleted', handleServiceUpdate);
    };
  }, [loadServices]);

  const handleAddSingleCredential = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    
    if (!email && !username) {
      toast.error('Please provide either email or username');
      return;
    }
    
    if (!password) {
      toast.error('Please provide a password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const credential = {
        email,
        password,
        username,
        pinCode,
        notes
      };
      
      await addCredentialToStock(selectedService, credential);
      
      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
      setPinCode('');
      setNotes('');
      
      window.dispatchEvent(new CustomEvent('credential-added'));
      
    } catch (error) {
      console.error('Error adding credential:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = async (data: any[]) => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    
    // Safely check if data is an array and has length
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('Invalid or empty CSV data');
      return;
    }
    
    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const row of data) {
        try {
          const credential = {
            email: row.email || '',
            password: row.password || '',
            username: row.username || '',
            pinCode: row.pinCode || row.pin_code || '',
            notes: row.notes || ''
          };
          
          // Make sure at least email or username is provided
          if (!credential.email && !credential.username) {
            console.error('Missing email and username for row:', row);
            errorCount++;
            continue;
          }
          
          // Make sure password is provided
          if (!credential.password) {
            console.error('Missing password for row:', row);
            errorCount++;
            continue;
          }
          
          await addCredentialToStock(selectedService, credential);
          successCount++;
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} credentials`);
        window.dispatchEvent(new CustomEvent('credential-added'));
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to add ${errorCount} credentials`);
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Error processing CSV file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credential Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add-single" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="add-single">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Single Credential
            </TabsTrigger>
            <TabsTrigger value="bulk-upload">
              <ArrowUp className="h-4 w-4 mr-2" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="credentials-list">
              <FileText className="h-4 w-4 mr-2" />
              Credentials List
            </TabsTrigger>
            <TabsTrigger value="stock-issues">
              Stock Issues
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-single">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="username123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinCode">PIN Code (optional)</Label>
                    <Input
                      id="pinCode"
                      placeholder="1234"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about this credential"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleAddSingleCredential} 
                  disabled={isSubmitting || !selectedService || (!email && !username) || !password}
                >
                  {isSubmitting ? 'Adding...' : 'Add Credential'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bulk-upload">
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="bulk-service">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="bulk-service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <CsvUploader 
                onDataLoaded={handleCsvUpload}
                isLoading={isSubmitting}
                expectedColumns={['email', 'password', 'username', 'pin_code', 'notes']}
              />
              
              <div className="p-4 bg-muted rounded-md mt-2">
                <h3 className="font-medium mb-2">CSV Format Instructions</h3>
                <p className="text-sm">Your CSV file should have these columns:</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>email - The account email</li>
                  <li>password - The account password (required)</li>
                  <li>username - The account username</li>
                  <li>pin_code - Optional PIN code</li>
                  <li>notes - Optional additional information</li>
                </ul>
                <p className="text-sm mt-2">At least email or username must be provided for each row.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="credentials-list">
            <AdminCredentialsList services={services} />
          </TabsContent>
          
          <TabsContent value="stock-issues">
            <AdminStockIssues services={services} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CredentialManager;
