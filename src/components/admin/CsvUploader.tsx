
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface CsvUploaderProps {
  onDataLoaded: (data: any[]) => void;
  isLoading?: boolean;
  expectedColumns?: string[];
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ 
  onDataLoaded, 
  isLoading = false,
  expectedColumns = []
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setFile(null);
      setPreview([]);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedData = parseCSV(csvText);
        setPreview(parsedData.slice(0, 3)); // Show first 3 rows as preview
        
        // Validate columns if expected columns are provided
        if (expectedColumns.length > 0) {
          const columns = Object.keys(parsedData[0] || {});
          const missingColumns = expectedColumns.filter(col => 
            !columns.includes(col) && !columns.includes(col.replace('_', ''))
          );
          
          if (missingColumns.length > 0) {
            setError(`Missing expected columns: ${missingColumns.join(', ')}`);
          }
        }
      } catch (err) {
        setError('Failed to parse CSV file');
        console.error('CSV parsing error:', err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (text: string): any[] => {
    // Simple CSV parser
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
          toast.error('CSV file is empty or invalid');
          return;
        }
        
        onDataLoaded(parsedData);
        toast.success(`Loaded ${parsedData.length} rows from CSV`);
      } catch (err) {
        console.error('CSV processing error:', err);
        toast.error('Failed to process CSV file');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary'
        }`}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        
        {file ? (
          <div className="space-y-2">
            <FileText className="h-8 w-8 mx-auto text-primary" />
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</div>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              CSV files only (max 10MB)
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-2 flex items-center justify-center text-sm text-red-500">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
      
      {preview.length > 0 && (
        <div className="bg-muted p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Preview:</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  {Object.keys(preview[0]).map((header, i) => (
                    <th key={i} className="px-2 py-1 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-dashed">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-2 py-1 truncate max-w-[100px]">
                        {value as string}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <Button 
        onClick={handleUpload}
        disabled={!file || !!error || isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Upload CSV'}
      </Button>
    </div>
  );
};

export default CsvUploader;
