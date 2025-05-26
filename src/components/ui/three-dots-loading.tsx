
import React from "react";
import { cn } from "@/lib/utils";

interface ThreeDotsLoadingProps {
  className?: string;
}

export const ThreeDotsLoading: React.FC<ThreeDotsLoadingProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};
