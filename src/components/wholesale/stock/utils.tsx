
import React from 'react';
import { Subscription } from '@/lib/types';
import { CheckCircle, AlertTriangle, Clock, Ban } from 'lucide-react';

export const getSubscriptionStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'expired':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'cancelled':
      return <Ban className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const getSubscriptionStatus = (subscription: Subscription) => {
  const status = subscription.status;
  
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        variant: 'success' as const,
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    case 'expired':
      return {
        label: 'Expired',
        variant: 'warning' as const,
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        variant: 'destructive' as const,
        icon: <Ban className="h-3 w-3 mr-1" />
      };
    default:
      return {
        label: 'Unknown',
        variant: 'outline' as const,
        icon: null
      };
  }
};

export const isSubscriptionActive = (subscription: Subscription) => {
  return subscription.status === 'active';
};

export const isSubscriptionExpired = (subscription: Subscription) => {
  return subscription.status === 'expired';
};

export const isSubscriptionCancelled = (subscription: Subscription) => {
  return subscription.status === 'cancelled';
};

export const isSubscriptionEndingSoon = (subscription: Subscription, days: number = 5) => {
  if (subscription.status !== 'active') return false;
  
  const end = new Date(subscription.endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 && diffDays <= days;
};

export const getRemainingDays = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add a function to filter subscriptions based on search term
export const filterSubscriptions = (subscriptions: Subscription[], searchTerm: string, category?: string) => {
  let filtered = subscriptions;
  
  // First apply category filter if provided
  if (category === 'ending-soon') {
    filtered = subscriptions.filter(sub => isSubscriptionEndingSoon(sub, 5));
  }
  
  // Then apply search term filter if provided
  if (searchTerm.trim()) {
    const lowercasedSearch = searchTerm.toLowerCase();
    
    filtered = filtered.filter(subscription => {
      // Search across multiple fields: customer name, service name, etc.
      const searchableFields = [
        subscription.id.toLowerCase(),
        subscription.status.toLowerCase(),
        subscription.credentials?.email?.toLowerCase() || '',
        subscription.credentials?.username?.toLowerCase() || ''
      ];
      
      return searchableFields.some(field => field.includes(lowercasedSearch));
    });
  }
  
  return filtered;
};
