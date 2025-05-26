
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Pencil, Save } from "lucide-react";

const ContentEditor = () => {
  const [contentItems, setContentItems] = useState([
    { id: '1', name: 'Hero Title', content: 'Fast & Secure Digital Services', location: 'Homepage' },
    { id: '2', name: 'Hero Subtitle', content: 'Get your services delivered instantly', location: 'Homepage' },
    { id: '3', name: 'About Us', content: 'We provide premium digital services with 24/7 support.', location: 'About Page' },
  ]);
  
  const [editing, setEditing] = useState(null);
  
  const saveContent = (id, newContent) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? {...item, content: newContent} : item
    ));
    setEditing(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Website Content</h3>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>
      
      <div className="grid gap-4">
        {contentItems.map(item => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  <CardDescription>Location: {item.location}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditing(editing === item.id ? null : item.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editing === item.id ? (
                <div className="space-y-2">
                  <Textarea 
                    defaultValue={item.content} 
                    id={`content-${item.id}`}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        const textareaElement = document.getElementById(`content-${item.id}`) as HTMLTextAreaElement;
                        saveContent(item.id, textareaElement.value);
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p>{item.content}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentEditor;
