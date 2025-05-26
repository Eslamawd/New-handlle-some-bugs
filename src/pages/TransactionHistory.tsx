
import React from "react";
import MainLayout from "@/components/MainLayout";
import TransactionHistory from "@/components/TransactionHistory";

const TransactionHistoryPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container py-8">
        <TransactionHistory />
      </div>
    </MainLayout>
  );
};

export default TransactionHistoryPage;
