
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DurationSelectorProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  isSubscription: boolean;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onDurationChange,
  isSubscription
}) => {
  if (!isSubscription) return null;
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="duration">Duration</Label>
      <Select 
        value={selectedDuration} 
        onValueChange={onDurationChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          {[1, 3, 6, 12].map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {month} {month === 1 ? 'month' : 'months'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DurationSelector;
