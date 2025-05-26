
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { Save } from 'lucide-react';

interface WholesaleProfileFormProps {
  username: string;
}

interface ProfileData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  bio: string;
}

const WholesaleProfileForm: React.FC<WholesaleProfileFormProps> = ({ username }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    bio: ''
  });

  useEffect(() => {
    if (username) {
      // Load user-specific profile data
      const savedProfile = localStorage.getItem(`wholesaleProfile_${username}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfileData(parsedProfile);
        } catch (error) {
          console.error("Error parsing saved profile:", error);
        }
      }
    }
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast.error("No user identified. Please log in again.");
      return;
    }
    
    // Save to localStorage with user-specific key
    localStorage.setItem(`wholesaleProfile_${username}`, JSON.stringify(profileData));
    
    // Show success message
    toast.success("Profile updated successfully");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            value={profileData.companyName}
            onChange={handleChange}
            placeholder="Your company name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Person</Label>
          <Input
            id="contactName"
            name="contactName"
            value={profileData.contactName}
            onChange={handleChange}
            placeholder="Primary contact name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleChange}
            placeholder="Your email address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Business Address</Label>
          <Input
            id="address"
            name="address"
            value={profileData.address}
            onChange={handleChange}
            placeholder="Your business address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / Business Number</Label>
          <Input
            id="taxId"
            name="taxId"
            value={profileData.taxId}
            onChange={handleChange}
            placeholder="Your tax ID or business number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Company Description</Label>
        <Textarea
          id="bio"
          name="bio"
          value={profileData.bio}
          onChange={handleChange}
          placeholder="A brief description of your business"
          rows={4}
        />
      </div>
      
      <Button type="submit" className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        Save Profile
      </Button>
    </form>
  );
};

export default WholesaleProfileForm;
