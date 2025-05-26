
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { SupportTicket } from "@/lib/types";

const UserTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // In a real app, fetch tickets from your API
    // For now, we'll get them from localStorage
    const allTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const userTickets = allTickets.filter((ticket: SupportTicket) => ticket.userId === user.id);
    setTickets(userTickets);
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-500">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Login Required</h3>
          <p className="text-muted-foreground">
            Please login to view your support tickets.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Tickets</h3>
          <p className="text-muted-foreground">
            You haven't submitted any support tickets yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Support Tickets</h2>
      
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {getStatusIcon(ticket.status)}
                <CardTitle className="text-base font-medium">{ticket.subject}</CardTitle>
                {getStatusBadge(ticket.status)}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              >
                {expandedTicket === ticket.id ? "Collapse" : "View"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted on {formatDate(ticket.createdAt)}
            </p>
          </CardHeader>
          
          {expandedTicket === ticket.id && (
            <CardContent className="p-4 pt-2">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm mt-1">{ticket.description}</p>
                </div>
                
                {ticket.imageUrl && (
                  <div>
                    <h4 className="text-sm font-medium">Attached Screenshot</h4>
                    <div className="mt-1 border rounded-md overflow-hidden">
                      <img 
                        src={ticket.imageUrl} 
                        alt="Screenshot" 
                        className="max-h-[200px] object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
                
                {/* This would show responses from support team */}
                <div className="pt-2">
                  <h4 className="text-sm font-medium">Support Response</h4>
                  <div className="bg-muted/50 p-3 rounded-md mt-1">
                    <p className="text-sm italic">
                      {ticket.status === 'open' 
                        ? "Waiting for support team response..." 
                        : "Our team is reviewing your request and will respond shortly."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UserTickets;
