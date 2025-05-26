
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NotesInputProps {
  notes: string;
  onChange: (value: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ notes, onChange }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="notes">Notes (Optional)</Label>
      <Input
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Additional instructions or notes"
      />
    </div>
  );
};

export default NotesInput;
