
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface MonthlySalesChartProps {
  monthlySalesData: Array<{
    month: string;
    total: number;
  }>;
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ monthlySalesData }) => {
  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>
          Revenue per month across all customers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySalesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '6px',
                  border: '1px solid #eaeaea',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesChart;
