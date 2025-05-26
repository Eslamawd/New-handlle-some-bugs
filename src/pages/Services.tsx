
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Service } from "@/lib/types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ServiceCard from "@/components/services/ServiceCard";
import { useSubscription } from "@/hooks/useSubscription";

const categories = [
  { id: "streaming", name: "Streaming Services", description: "Enjoy your favorite movies and TV shows.", icon: "tv" },
  { id: "gaming", name: "Gaming Credits", description: "Top up your gaming accounts.", icon: "gamepad" },
  { id: "social", name: "Social Media", description: "Boost your social media presence.", icon: "users" },
  { id: "recharge", name: "Recharge Services", description: "Recharge your mobile and other services.", icon: "phone" },
  { id: "giftcard", name: "Gift Cards", description: "Send gift cards to your loved ones.", icon: "gift" },
  { id: "vpn", name: "VPN Services", description: "Secure your internet connection.", icon: "lock" },
  { id: "other", name: "Other Services", description: "Explore a variety of other services.", icon: "box" }
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isLoading } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    const storedServices = localStorage.getItem('services');
    const parsedServices = storedServices ? JSON.parse(storedServices) : [];
    setServices(parsedServices);
    setFilteredServices(parsedServices);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredServices(results);
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery, services]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/services/${categoryId}`);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Our Services</h1>
          <p className="text-muted-foreground">
            Explore our wide range of services designed to meet your needs.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for services..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const categoryId = service.categoryId || "";
            return (
              <ServiceCard
                key={`service-${service.id}`}
                service={service}
              />
            );
          })}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ServicesPage;
