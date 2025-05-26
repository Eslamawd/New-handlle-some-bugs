
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import { Mail, Save } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const gmailFormSchema = z.object({
  email: z.string().email("Please enter a valid Gmail address"),
  password: z.string().min(1, "Password is required"),
  enableNotifications: z.boolean().default(false),
  autoSync: z.boolean().default(false),
});

type GmailFormValues = z.infer<typeof gmailFormSchema>;

const AdminGmailSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Load existing settings from localStorage if available
  const existingSettings = localStorage.getItem("gmailSettings");
  const defaultValues: GmailFormValues = existingSettings 
    ? JSON.parse(existingSettings) 
    : {
        email: "",
        password: "",
        enableNotifications: false,
        autoSync: false,
      };

  const form = useForm<GmailFormValues>({
    resolver: zodResolver(gmailFormSchema),
    defaultValues,
  });

  const onSubmit = (data: GmailFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Store settings in localStorage (in a real app, you'd send to backend)
      localStorage.setItem("gmailSettings", JSON.stringify(data));
      
      toast.success("Gmail settings saved successfully");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gmail Integration</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Gmail Account Settings
          </CardTitle>
          <CardDescription>
            Connect your Gmail account to enable email synchronization and automated responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gmail Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@gmail.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the Gmail address you want to connect.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your Gmail app password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use an app password for better security. 
                        <a href="https://support.google.com/accounts/answer/185833" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline ml-1">
                          How to create one?
                        </a>
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Integration Options</h3>
                
                <FormField
                  control={form.control}
                  name="enableNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications when new emails arrive.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Synchronization</FormLabel>
                        <FormDescription>
                          Automatically sync emails with the platform.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Gmail Settings
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGmailSettings;
