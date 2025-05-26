
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "purchase";
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed";
  date: string;
  description?: string;
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    // Load transaction history from localStorage
    const storedTransactions = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
    
    // Add purchase transactions from orders
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const purchaseTransactions = orders.map((order: any) => ({
      id: `txn-${order.id.replace('order-', '')}`,
      type: "purchase" as const,
      amount: order.totalPrice,
      method: "Account Balance",
      status: order.status === "completed" ? "completed" as const : "pending" as const,
      date: order.createdAt,
      description: `Order #${order.id.split('-')[1]}`
    }));
    
    // Combine and sort by date (newest first)
    const allTransactions = [...storedTransactions, ...purchaseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(allTransactions);
  }, []);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-orange-500" />;
      case 'purchase':
        return <ArrowUpIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getAmountDisplay = (transaction: Transaction) => {
    const prefix = transaction.type === 'deposit' ? '+' : '-';
    return (
      <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
        {prefix}${transaction.amount.toFixed(2)}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold">Transaction History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>
            Review your payment history and purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAmountDisplay(transaction)}
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TransactionHistory;
