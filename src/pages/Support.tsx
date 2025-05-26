
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupportTicketForm from "@/components/SupportTicketForm";
import { MessageSquare, FileQuestion, LifeBuoy, BookOpen, Share2, Ticket } from "lucide-react";
import ChatButton from "@/components/support/ChatButton";
import PrioritySupport from "@/components/support/PrioritySupport";
import UserTickets from "@/components/support/UserTickets";
import { toast } from "sonner";

const Support: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("contact");
  
  // Get tab from URL parameter if it exists
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["contact", "faq", "guides", "community", "tickets"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleGuideClick = (guideName: string) => {
    toast.info(`Opening guide: ${guideName}`, {
      description: "This would open the detailed guide in a real app",
    });
  };

  const handleCommunityActionClick = (platform: string) => {
    toast.info(`Redirecting to ${platform}`, {
      description: `You would be redirected to our ${platform} in a real app`,
    });
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Support Center</h1>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="contact">Contact Us</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Live Chat
                    </CardTitle>
                    <CardDescription>
                      Chat with our support team in real-time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Available Monday to Friday, 9 AM - 6 PM EST.
                    </p>
                    <ChatButton />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LifeBuoy className="h-5 w-5 text-primary" />
                      Priority Support
                    </CardTitle>
                    <CardDescription>
                      Get faster response for urgent matters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      24/7 availability for Premium users.
                    </p>
                    <PrioritySupport />
                  </CardContent>
                </Card>
              </div>
              
              <SupportTicketForm />
            </TabsContent>
            
            <TabsContent value="tickets" className="space-y-6 mt-6">
              <UserTickets />
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Find quick answers to common questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="font-medium mb-2">How long do account credentials typically take to arrive?</h3>
                    <p className="text-sm text-muted-foreground">Account credentials are typically delivered immediately after purchase through our automated system. In rare cases, it might take up to 30 minutes.</p>
                  </div>
                  <div className="border-b pb-3">
                    <h3 className="font-medium mb-2">What happens if my account stops working?</h3>
                    <p className="text-sm text-muted-foreground">If your account stops working within the warranty period, simply contact our support team through the dashboard, and we'll provide a replacement.</p>
                  </div>
                  <div className="border-b pb-3">
                    <h3 className="font-medium mb-2">Do you offer refunds?</h3>
                    <p className="text-sm text-muted-foreground">We offer refunds within 24 hours of purchase if the service doesn't work as described. Please contact support for assistance.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">How do I change my payment method?</h3>
                    <p className="text-sm text-muted-foreground">You can update your payment methods in the Dashboard under the "Payment Settings" section. We accept credit cards, PayPal, and cryptocurrency.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="guides" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    User Guides
                  </CardTitle>
                  <CardDescription>
                    Step-by-step instructions for our services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Getting Started</h3>
                      <p className="text-sm text-muted-foreground mb-3">Learn the basics of navigating and using our platform.</p>
                      <button 
                        className="text-primary text-sm font-medium"
                        onClick={() => handleGuideClick("Getting Started")}
                      >
                        Read Guide →
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Streaming Services Setup</h3>
                      <p className="text-sm text-muted-foreground mb-3">How to set up and start using your streaming accounts.</p>
                      <button 
                        className="text-primary text-sm font-medium"
                        onClick={() => handleGuideClick("Streaming Services Setup")}
                      >
                        Read Guide →
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Managing Subscriptions</h3>
                      <p className="text-sm text-muted-foreground mb-3">How to view, manage and renew your active subscriptions.</p>
                      <button 
                        className="text-primary text-sm font-medium"
                        onClick={() => handleGuideClick("Managing Subscriptions")}
                      >
                        Read Guide →
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Account Recovery</h3>
                      <p className="text-sm text-muted-foreground mb-3">Steps to recover or reset account credentials.</p>
                      <button 
                        className="text-primary text-sm font-medium"
                        onClick={() => handleGuideClick("Account Recovery")}
                      >
                        Read Guide →
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="community" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Community Resources
                  </CardTitle>
                  <CardDescription>
                    Connect with other users and find additional help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium mb-2">Discord</h3>
                      <p className="text-sm text-muted-foreground mb-3">Join our community Discord for real-time discussions.</p>
                      <button 
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full"
                        onClick={() => handleCommunityActionClick("Discord")}
                      >
                        Join Discord
                      </button>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium mb-2">Forums</h3>
                      <p className="text-sm text-muted-foreground mb-3">Browse our community forums for tips and solutions.</p>
                      <button 
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full"
                        onClick={() => handleCommunityActionClick("Forums")}
                      >
                        Visit Forums
                      </button>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium mb-2">Knowledge Base</h3>
                      <p className="text-sm text-muted-foreground mb-3">Explore our extensive knowledge base articles.</p>
                      <button 
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full"
                        onClick={() => handleCommunityActionClick("Knowledge Base")}
                      >
                        Browse Articles
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Support;
