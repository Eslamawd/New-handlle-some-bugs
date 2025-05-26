
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

const PrioritySupport: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleContactPrioritySupport = () => {
    if (!user) {
      toast.error("You need to be logged in to access Priority Support");
      return;
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    // In a real app, this would send a request to your backend
    // For now, we'll just show a success toast
    toast.success("Priority support request received", {
      description: "A support agent will contact you shortly",
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button onClick={handleContactPrioritySupport} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
        <LifeBuoy className="h-4 w-4 mr-2" />
        Contact Priority Support
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Priority Support Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-muted rounded-md mb-4">
              <p className="text-sm">24/7 priority support is available for premium users.</p>
              <p className="text-sm mt-2">A dedicated support agent will be assigned to your case immediately.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="issue" className="text-sm font-medium">Describe your urgent issue:</label>
              <textarea
                id="issue"
                className="min-h-[120px] w-full p-3 border rounded-md"
                placeholder="Please provide details about your urgent issue..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred contact method:</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="contactMethod" defaultChecked />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="contactMethod" />
                  <span>Phone</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrioritySupport;
