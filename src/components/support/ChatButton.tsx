
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const ChatButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleStartChat = () => {
    setIsDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    // Store chat message in localStorage for demo purposes
    setTimeout(() => {
      const chatMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      };
      
      chatMessages.push(newMessage);
      localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
      
      setIsSending(false);
      setMessage('');
      
      toast.success("Message sent to support");
      setIsDialogOpen(false);
    }, 1000);
  };

  return (
    <>
      <Button onClick={handleStartChat} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
        <MessageSquare className="h-4 w-4 mr-2" />
        Start Chat
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat with Support</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-muted rounded-md mb-4">
              <p className="text-sm">Support hours: Monday to Friday, 9 AM - 6 PM EST</p>
              <p className="text-sm mt-2">How can we help you today?</p>
            </div>
            <textarea
              className="min-h-[120px] w-full p-3 border rounded-md"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatButton;
