"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

type TransactionType = "all" | "onramp" | "offramp" | "transfer" | "link";
type TransactionStatus = "all" | "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "PAID" | "PROCESSING" | "SETTLING";

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
  transactionHash?: string;
  explorerUrl?: string;
  metadata?: any;
}

interface HistoryData {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalOnramp: number;
    totalOfframp: number;
    totalTransfer: number;
    totalLink: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
  };
  pagination: {
    limit: number;
    skip: number;
    hasMore: boolean;
    total: number;
  };
}

export default function TransactionHistory() {
  const [selectedType, setSelectedType] = useState<TransactionType>("all");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [selectedType, selectedStatus]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 50,
        skip: 0
      };

      if (selectedType !== "all") {
        params.type = selectedType;
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }

      const response = await apiClient.getTransactionHistory(params);
      
      if (response.success && response.data) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, metadata?: any) => {
    switch (type) {
      case "onramp":
        return <ArrowDownIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "offramp":
        return <ArrowUpIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "transfer":
      case "link":
        const isReceived = metadata?.direction === "RECEIVED" || metadata?.toUsername;
        return isReceived ? (
          <ArrowDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <ArrowUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        );
      default:
        return <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTransactionLabel = (type: string, metadata?: any) => {
    switch (type) {
      case "onramp":
        return "Received";
      case "offramp":
        return "Sent";
      case "transfer":
      case "link":
        const isReceived = metadata?.direction === "RECEIVED" || metadata?.toUsername;
        return isReceived ? "Received" : "Sent";
      default:
        return "Transaction";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "PENDING":
      case "PROCESSING":
      case "SETTLING":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
      case "FAILED":
      case "CANCELLED":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      case "PAID":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredTransactions = historyData?.transactions.filter(tx => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.description.toLowerCase().includes(query) ||
        tx.reference?.toLowerCase().includes(query) ||
        tx.transactionId.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <div className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#F6EDFF]/80 dark:bg-[#252525]/80 backdrop-blur-md z-10 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
            </Link>
            <h1 className="font-bold text-xl text-slate-900 dark:text-white">Transaction History</h1>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <FunnelIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
        </header>

        {/* Summary Cards */}
        {historyData && (
          <div className="px-6 py-4 grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#3D3D3D] rounded-xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3]">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{historyData.summary.totalTransactions}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-700">
              <p className="text-xs text-green-700 dark:text-green-400 font-bold uppercase mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{historyData.summary.completedCount}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 space-y-4">
            {/* Type Filter */}
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Transaction Type</p>
              <div className="flex gap-2 flex-wrap">
                {(["all", "onramp", "offramp", "transfer", "link"] as TransactionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedType === type
                        ? "bg-[#D364DB] text-white"
                        : "bg-white dark:bg-[#3D3D3D] text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-[#A3A3A3] hover:border-[#D364DB]"
                    }`}
                  >
                    {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Status</p>
              <div className="flex gap-2 flex-wrap">
                {(["all", "COMPLETED", "PENDING", "FAILED"] as TransactionStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedStatus === status
                        ? "bg-[#D364DB] text-white"
                        : "bg-white dark:bg-[#3D3D3D] text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-[#A3A3A3] hover:border-[#D364DB]"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D364DB]"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-6 pb-32">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-[#3D3D3D] rounded-xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3] animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.transactionId}
                  className="bg-white dark:bg-[#3D3D3D] rounded-xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3] hover:border-[#D364DB] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getTransactionIcon(tx.type, tx.metadata)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {getTransactionLabel(tx.type, tx.metadata)} • {formatDate(tx.date)}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                          {tx.reference && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                              {tx.reference.slice(0, 16)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${
                        tx.type === "onramp" 
                          ? "text-green-600 dark:text-green-400" 
                          : tx.type === "offramp"
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-900 dark:text-white"
                      }`}>
                        {tx.type === "onramp" ? "+" : tx.type === "offramp" ? "-" : ""}{tx.amountUSDC?.toFixed(2) || tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tx.type === "onramp" ? `₦${tx.amountNGN?.toLocaleString()}` : 
                         tx.type === "offramp" ? `₦${tx.amountNGN?.toLocaleString()}` : 
                         "USDC"}
                      </p>
                      
                      {tx.explorerUrl && (
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#D364DB] hover:underline mt-1 inline-block"
                        >
                          View on explorer
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}