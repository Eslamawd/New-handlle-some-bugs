import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscriptionIssue, IssueType, IssueStatus } from "@/lib/types";
import { toast } from "sonner";
import { 
  Search, 
  UserCog, 
  CreditCard, 
  KeyRound, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  RotateCw
} from "lucide-react";
import { 
  getSubscriptionIssues, 
  resolveSubscriptionIssue, 
  getCustomerById,
  sendCustomerNotification
} from "@/lib/data";

const SubscriptionIssues = () => {
  const [issues, setIssues] = useState<SubscriptionIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<SubscriptionIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | IssueType | IssueStatus>("all");
  const [selectedIssue, setSelectedIssue] = useState<SubscriptionIssue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Fetch issues on mount
  useEffect(() => {
    const fetchIssues = async () => {
      const fetchedIssues = await getSubscriptionIssues();
      setIssues(fetchedIssues);
      setFilteredIssues(fetchedIssues);
    };
    
    fetchIssues();
  }, []);

  // Filter issues based on search and tabs
  useEffect(() => {
    let filtered = issues;
    
    // Filter by tab
    if (activeTab !== "all") {
      if (["profile_fix", "payment_issue", "password_reset"].includes(activeTab)) {
        filtered = filtered.filter(issue => issue.type === activeTab);
      } else if (["pending", "in_progress", "resolved"].includes(activeTab)) {
        filtered = filtered.filter(issue => issue.status === activeTab);
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        issue => 
          issue.customerName.toLowerCase().includes(query) ||
          issue.serviceName.toLowerCase().includes(query) ||
          (issue.credentials?.email && issue.credentials.email.toLowerCase().includes(query))
      );
    }
    
    setFilteredIssues(filtered);
  }, [issues, activeTab, searchQuery]);

  const handleResolveIssue = async () => {
    if (!selectedIssue) return;
    
    setIsResolving(true);
    try {
      await resolveSubscriptionIssue(
        selectedIssue.id, 
        "admin", // Replace with actual admin ID when authentication is implemented
        resolutionNote
      );
      
      // Send notification to customer
      const customer = getCustomerById(selectedIssue.userId);
      if (customer) {
        const notificationType = 
          selectedIssue.type === "profile_fix" ? "profile_fixed" : 
          selectedIssue.type === "payment_issue" ? "payment_resolved" : 
          "password_reset";
        
        await sendCustomerNotification({
          userId: selectedIssue.userId,
          type: notificationType,
          message: `Your ${selectedIssue.type.replace('_', ' ')} request for ${selectedIssue.serviceName} has been resolved`,
          subscriptionId: selectedIssue.subscriptionId,
          serviceName: selectedIssue.serviceName,
        });
      }
      
      // Update local state
      const updatedIssues = issues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, status: "resolved" as IssueStatus, resolvedAt: new Date().toISOString() }
          : issue
      );
      
      setIssues(updatedIssues);
      toast.success("Issue marked as resolved");
      setIsDetailsOpen(false);
      setResolutionNote("");
    } catch (error) {
      console.error("Error resolving issue:", error);
      toast.error("Failed to resolve issue");
    } finally {
      setIsResolving(false);
    }
  };

  const getIssueTypeLabel = (type: IssueType) => {
    switch (type) {
      case "profile_fix": return "Profile Fix";
      case "payment_issue": return "Payment Issue";
      case "password_reset": return "Password Reset";
    }
  };

  const getIssueTypeIcon = (type: IssueType) => {
    switch (type) {
      case "profile_fix": return <UserCog className="h-4 w-4" />;
      case "payment_issue": return <CreditCard className="h-4 w-4" />;
      case "password_reset": return <KeyRound className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Issues</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by customer, service, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | IssueType | IssueStatus)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="profile_fix">Profile Fixes</TabsTrigger>
          <TabsTrigger value="payment_issue">Payment Issues</TabsTrigger>
          <TabsTrigger value="password_reset">Password Resets</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        {/* Other tabs will share the same content */}
        <TabsContent value="profile_fix" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="payment_issue" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="password_reset" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="in_progress" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          <IssueList 
            issues={filteredIssues} 
            onViewDetails={(issue) => {
              setSelectedIssue(issue);
              setIsDetailsOpen(true);
            }}
            getStatusBadge={getStatusBadge}
            getIssueTypeIcon={getIssueTypeIcon}
          />
        </TabsContent>
      </Tabs>
      
      {/* Issue Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <p className="text-base font-medium">{selectedIssue.customerName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Service</h3>
                  <p className="text-base font-medium">{selectedIssue.serviceName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Issue Type</h3>
                  <div className="flex items-center mt-1">
                    {getIssueTypeIcon(selectedIssue.type)}
                    <span className="ml-1">{getIssueTypeLabel(selectedIssue.type)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-base">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedIssue.resolvedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Resolved At</h3>
                    <p className="text-base">{new Date(selectedIssue.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
                
                {selectedIssue.credentials && (
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Credentials</h3>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Email:</span>
                          <p className="font-mono">{selectedIssue.credentials.email}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Password:</span>
                          <p className="font-mono">{selectedIssue.credentials.password}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedIssue.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-base mt-1">{selectedIssue.notes}</p>
                  </div>
                )}
              </div>
              
              {selectedIssue.status !== "resolved" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Resolution Notes</h3>
                  <Textarea
                    placeholder="Enter resolution details..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {selectedIssue && selectedIssue.status !== "resolved" && (
              <Button 
                onClick={handleResolveIssue} 
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isResolving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface IssueListProps {
  issues: SubscriptionIssue[];
  onViewDetails: (issue: SubscriptionIssue) => void;
  getStatusBadge: (status: IssueStatus) => React.ReactNode;
  getIssueTypeIcon: (type: IssueType) => React.ReactNode;
}

const IssueList: React.FC<IssueListProps> = ({ 
  issues, 
  onViewDetails, 
  getStatusBadge,
  getIssueTypeIcon
}) => {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No issues found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map(issue => (
              <TableRow key={issue.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getIssueTypeIcon(issue.type)}
                    <span>{issue.type.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>{issue.customerName}</TableCell>
                <TableCell>{issue.serviceName}</TableCell>
                <TableCell>
                  {issue.credentials?.email ? (
                    <span className="font-mono text-xs">{issue.credentials.email}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                  )}
                </TableCell>
                <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(issue.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onViewDetails(issue)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionIssues;
