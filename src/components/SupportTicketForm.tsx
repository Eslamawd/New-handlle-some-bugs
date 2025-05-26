
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters")
});

type SupportTicketFormValues = z.infer<typeof ticketSchema>;

const SupportTicketForm: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: ""
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SupportTicketFormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a ticket");
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, you would upload the image and send the form data to your backend
    // For now, we'll simulate the API call with a timeout
    setTimeout(() => {
      // Store the ticket in localStorage for demo purposes
      const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
      const newTicket = {
        id: `ticket-${Date.now()}`,
        userId: user.id || "guest-user", // Use actual user ID from auth context
        subject: data.subject,
        description: data.description,
        imageUrl: imagePreview,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      tickets.push(newTicket);
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
      
      // Reset form and state
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      setIsSubmitting(false);
      
      // Show success message
      toast.success("Your support ticket has been submitted successfully!", {
        description: "We'll get back to you shortly.",
      });
    }, 1500);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
        <CardDescription>
          Describe the problem you're experiencing and attach a screenshot if possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Briefly describe your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide details about the issue you're experiencing" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel htmlFor="screenshot">Screenshot (optional)</FormLabel>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('screenshot')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imageFile && (
                    <span className="text-sm text-muted-foreground">
                      {imageFile.name}
                    </span>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Screenshot preview" 
                      className="max-h-[300px] object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !user}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
              {!user && (
                <p className="text-sm text-muted-foreground mt-2">
                  You must be logged in to submit a support ticket.
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupportTicketForm;
