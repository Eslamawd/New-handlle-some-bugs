
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Send
} from "lucide-react";
import { SupportTicket } from "@/lib/types";
import { toast } from "@/lib/toast";

interface ExtendedSupportTicket extends SupportTicket {
  imageUrl?: string;
}

const AdminSupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>([]);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // In a real app, you would fetch tickets from your API
    // For now, we'll get them from localStorage
    const storedTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    setTickets(storedTickets);
  }, []);
  
  const handleStatusChange = (ticketId: string, newStatus: "open" | "in-progress" | "resolved" | "closed") => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() } 
        : ticket
    );
    
    setTickets(updatedTickets);
    localStorage.setItem('supportTickets', JSON.stringify(updatedTickets));
    toast.success(`Ticket status updated to ${newStatus}`);
  };
  
  const handleResponseChange = (ticketId: string, value: string) => {
    setResponses({
      ...responses,
      [ticketId]: value
    });
  };
  
  const sendResponse = (ticketId: string) => {
    if (!responses[ticketId]?.trim()) {
      toast.error("Please enter a response");
      return;
    }
    
    // In a real app, you would send the response to your API
    // For now, we'll just update the local state
    toast.success("Response sent to customer");
    
    // Clear the response input
    setResponses({
      ...responses,
      [ticketId]: ""
    });
    
    // Update the ticket status to in-progress if it's currently open
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.status === "open") {
      handleStatusChange(ticketId, "in-progress");
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "resolved":
        return "bg-green-500 hover:bg-green-600";
      case "closed":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
          <p className="text-muted-foreground">
            When customers report issues, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="flex gap-2">
          <Badge className="bg-yellow-500">{tickets.filter(t => t.status === "open").length} Open</Badge>
          <Badge className="bg-blue-500">{tickets.filter(t => t.status === "in-progress").length} In Progress</Badge>
          <Badge className="bg-green-500">{tickets.filter(t => t.status === "resolved").length} Resolved</Badge>
        </div>
      </div>
      
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>{ticket.subject}</span>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>Reported on {formatDate(ticket.createdAt)}</span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              >
                {expandedTicket === ticket.id ? "Collapse" : "View Details"}
              </Button>
            </div>
          </CardHeader>
          
          {expandedTicket === ticket.id && (
            <>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                  
                  {ticket.imageUrl && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Attached Screenshot</h4>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={ticket.imageUrl} 
                          alt="Ticket screenshot" 
                          className="max-h-[300px] object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Response</h4>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your response to the customer..."
                        value={responses[ticket.id] || ""}
                        onChange={(e) => handleResponseChange(ticket.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm"
                          onClick={() => sendResponse(ticket.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Response
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between py-3 bg-muted/50">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(ticket.id, "in-progress")}
                    disabled={ticket.status === "in-progress"}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Mark In Progress
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleStatusChange(ticket.id, "resolved")}
                    disabled={ticket.status === "resolved"}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleStatusChange(ticket.id, "closed")}
                    disabled={ticket.status === "closed"}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Close Ticket
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AdminSupportTickets;
