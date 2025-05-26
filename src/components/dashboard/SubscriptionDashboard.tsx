
import React from 'react';
import DashboardCredentials from './DashboardCredentials';
import SubscriptionTracker from './SubscriptionTracker';
import { loadServices } from '@/lib/productManager';

const SubscriptionDashboard: React.FC = () => {
  const services = loadServices();
  
  return (
    <div className="grid gap-6">
      <h2 className="text-3xl font-bold">Your Subscriptions</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCredentials />
        <SubscriptionTracker services={services} />
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
