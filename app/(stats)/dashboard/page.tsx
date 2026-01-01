'use client';
import React from 'react';
import { DashboardClient, DashboardData } from './_components/DashboardClient';
import { Wallet, DollarSign, FileText, TrendingUp, Music, FileText as FileTextIcon, Zap } from 'lucide-react';

// Mock data matching the image
const mockDashboardData: DashboardData = {
  summaries: [
    {
      title: "Total Balance",
      value: 24563.00,
      change: 2.5,
      icon: Wallet,
    },
    {
      title: "Monthly Income",
      value: 8240.00,
      change: 4.1,
      icon: DollarSign,
    },
    {
      title: "Monthly Expenses",
      value: 3120.00,
      change: -1.2,
      icon: FileText,
    },
    {
      title: "Investments",
      value: 12450.00,
      change: 10.5,
      icon: TrendingUp,
    },
  ],
  financialData: [
    { month: "Jan", income: 8000, expenses: 3500 },
    { month: "Feb", income: 7500, expenses: 3200 },
    { month: "Mar", income: 8200, expenses: 4200 },
    { month: "Apr", income: 8500, expenses: 3800 },
    { month: "May", income: 8800, expenses: 3600 },
    { month: "Jun", income: 9000, expenses: 3400 },
    { month: "Jul", income: 9200, expenses: 3300 },
  ],
  recentTransactions: [
    {
      id: "1",
      name: "Netflix Subscription",
      category: "Entertainment",
      amount: -15.99,
      timestamp: new Date().toISOString(),
      icon: Music,
    },
    {
      id: "2",
      name: "Freelance Project",
      category: "Income",
      amount: 1250.00,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: Wallet,
    },
    {
      id: "3",
      name: "Grocery Store",
      category: "Food",
      amount: -84.20,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: FileTextIcon,
    },
    {
      id: "4",
      name: "Gas Station",
      category: "Transport",
      amount: -45.00,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Zap,
    },
  ],
  totalTransactionCount: 12,
};

const page = async () => {
  return (
    <DashboardClient data={mockDashboardData} />
  );
};

export default page;
