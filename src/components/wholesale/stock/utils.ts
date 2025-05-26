
import { Subscription } from '@/lib/types';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import React from 'react';

export const getSubscriptionStatus = (subscription: Subscription) => {
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (subscription.status === 'expired' || endDate < now) {
    return { 
      label: 'Expired', 
      variant: 'destructive', 
      icon: React.createElement(AlertCircle, { className: "h-3 w-3 mr-1" })
    };
  }
  
  if (daysLeft <= 7) {
    return { 
      label: `${daysLeft} days left`, 
      variant: 'warning', 
      icon: React.createElement(Clock, { className: "h-3 w-3 mr-1" })
    };
  }
  
  return { 
    label: 'Active', 
    variant: 'success', 
    icon: React.createElement(CheckCircle, { className: "h-3 w-3 mr-1" })
  };
};

// Add the missing isSubscriptionEndingSoon function
export const isSubscriptionEndingSoon = (subscription: Subscription, daysThreshold: number = 7): boolean => {
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysLeft > 0 && daysLeft <= daysThreshold;
};

// Add the missing filterSubscriptions function
export const filterSubscriptions = (
  subscriptions: Subscription[], 
  searchTerm: string, 
  category: string
): Subscription[] => {
  if (!Array.isArray(subscriptions)) return [];
  
  let filtered = [...subscriptions];
  
  // Apply category filter
  if (category && category !== 'all') {
    if (category === 'ending-soon') {
      filtered = filtered.filter(sub => isSubscriptionEndingSoon(sub, 5));
    }
  }
  
  // Apply search term filter if provided
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(sub => {
      // We can add more search criteria here if needed
      return sub.id.toLowerCase().includes(searchLower) || 
             sub.serviceId.toLowerCase().includes(searchLower);
    });
  }
  
  return filtered;
};
