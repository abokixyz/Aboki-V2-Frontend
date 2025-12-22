"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

interface Transaction {
  transactionId: string;
  type: "onramp" | "offramp" | "transfer" | "link";
  description: string;
  amount: number;
  amountUSDC?: number;
  amountNGN?: number;
  currency: string;
  status: string;
  date: string;
  reference?: string;
}

export default function RecentActivity() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const response = await apiClient.getTransactionHistory({ 
        limit: 5,
        status: 'COMPLETED' 
      });
      
      if (response.success && response.data?.transactions) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch recent transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, metadata?: any) => {
    switch (type) {
      case "onramp":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ArrowDownIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        );
      case "offramp":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ArrowUpIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        );
      case "transfer":
      case "link":
        const isReceived = metadata?.direction === "RECEIVED" || metadata?.toUsername;
        return isReceived ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ArrowDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ArrowUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getAmountDisplay = (tx: Transaction) => {
    if (tx.type === "onramp") {
      return {
        amount: `+${tx.amountUSDC?.toFixed(2)}`,
        subtitle: `₦${tx.amountNGN?.toLocaleString()}`,
        color: "text-green-600 dark:text-green-400"
      };
    } else if (tx.type === "offramp") {
      return {
        amount: `-${tx.amountUSDC?.toFixed(2)}`,
        subtitle: `₦${tx.amountNGN?.toLocaleString()}`,
        color: "text-red-600 dark:text-red-400"
      };
    } else {
      return {
        amount: `${tx.amountUSDC?.toFixed(2) || tx.amount.toFixed(2)}`,
        subtitle: "USDC",
        color: "text-slate-900 dark:text-white"
      };
    }
  };

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-[#A3A3A3] animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="p-8 bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-[#A3A3A3] text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No recent transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
        <Link 
          href="/history" 
          className="text-sm text-[#D364DB] hover:text-[#C554CB] font-bold transition-colors"
        >
          See all
        </Link>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => {
          const display = getAmountDisplay(tx);
          
          return (
            <div 
              key={tx.transactionId} 
              className="flex items-center justify-between p-4 bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-[#A3A3A3] hover:border-[#D364DB] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {getTransactionIcon(tx.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} • {formatDate(tx.date)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm ${display.color}`}>
                  {display.amount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {display.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}