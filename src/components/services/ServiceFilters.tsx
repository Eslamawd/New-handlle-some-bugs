
import React from "react";
import { Filter } from "lucide-react";
import { ServiceCategory } from "@/lib/types";

interface ServiceFiltersProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  serviceCategories: ServiceCategory[];
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ 
  selectedCategory, 
  setSelectedCategory, 
  serviceCategories 
}) => {
  return (
    <div className="hidden md:block space-y-6 md:col-span-1">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-lg mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Services
          </button>
          {serviceCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;
