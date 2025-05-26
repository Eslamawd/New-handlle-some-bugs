
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, Check, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChatInterface from "@/components/admin/AdminChatInterface";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot" | "admin";
  timestamp: Date;
  responded?: boolean;
  response?: string;
}

const AdminChatMessages: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load messages from localStorage
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    // Filter to only show user messages
    const userMessages = storedMessages.filter((msg: ChatMessage) => msg.sender === "user");
    setMessages(userMessages);
  }, []);

  const handleResponseChange = (id: string, value: string) => {
    setResponses({
      ...responses,
      [id]: value
    });
  };

  const sendResponse = (id: string) => {
    if (!responses[id]?.trim()) {
      toast.error("Please enter a response");
      return;
    }

    // Create admin response message
    const adminResponse: ChatMessage = {
      id: Date.now().toString(),
      text: responses[id],
      sender: "admin",
      timestamp: new Date()
    };

    // Update the message with a response
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, responded: true, response: responses[id] } : msg
    );
    
    setMessages(updatedMessages);
    
    // Add the admin response to chat history
    const chatHistory = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    const updatedChatHistory = [...chatHistory, adminResponse];
    localStorage.setItem("chatMessages", JSON.stringify(updatedChatHistory));
    
    toast.success("Response sent to customer");
    
    // Clear the response input
    setResponses({
      ...responses,
      [id]: ""
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const ArchivedMessagesContent = () => {
    if (messages.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Chat Messages</h3>
            <p className="text-muted-foreground">
              When customers send chat messages, they will appear here.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Archived Chat Messages</h2>
          <Badge>{messages.length} Messages</Badge>
        </div>
        
        {messages.map((message) => (
          <Card key={message.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>User Message</span>
                    {message.responded ? (
                      <Badge className="bg-green-500">Responded</Badge>
                    ) : (
                      <Badge className="bg-yellow-500">Pending</Badge>
                    )}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDate(message.timestamp)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
                >
                  {expandedMessage === message.id ? "Collapse" : "View & Respond"}
                </Button>
              </div>
            </CardHeader>
            
            {expandedMessage === message.id && (
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Customer Message</h4>
                    <p className="text-sm border p-3 rounded-md bg-muted/50">
                      {message.text}
                    </p>
                  </div>
                  
                  {message.responded && message.response && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Your Response</h4>
                      <p className="text-sm border p-3 rounded-md bg-primary/5">
                        {message.response}
                      </p>
                    </div>
                  )}
                  
                  {!message.responded && (
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Send Response</h4>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type your response to the customer..."
                          value={responses[message.id] || ""}
                          onChange={(e) => handleResponseChange(message.id, e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => sendResponse(message.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Response
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="live" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="live">Live Support</TabsTrigger>
        <TabsTrigger value="archived">Archived Messages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="live">
        <AdminChatInterface />
      </TabsContent>
      
      <TabsContent value="archived">
        <ArchivedMessagesContent />
      </TabsContent>
    </Tabs>
  );
};

export default AdminChatMessages;
