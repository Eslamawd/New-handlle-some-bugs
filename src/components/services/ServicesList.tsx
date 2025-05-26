import React from "react";
import { Service } from "@/lib/types";
import ServiceCard from "./ServiceCard";

interface ServicesListProps {
  services: Service[];
  categories: {
    id: string;
    name: string;
    description: string;
    icon: string;
  }[];
}

const ServicesList: React.FC<ServicesListProps> = ({ services, categories }) => {
  if (!services || services.length === 0) {
    return <p>No services available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const categoryId = service.categoryId || "";
        const category = categories.find((cat) => cat.id === categoryId);

        return (
          <ServiceCard
            key={`service-${service.id}`}
            service={service}
          />
        );
      })}
    </div>
  );
};

export default ServicesList;
