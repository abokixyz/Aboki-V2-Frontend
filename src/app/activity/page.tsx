"use client"

import Link from "next/link";
import { ChevronLeftIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock Data Grouped
const HISTORY = [
  {
    title: "Today",
    items: [
      { id: 1, name: "Emeka O.", type: "Received", amount: 50.00, time: "9:41 AM", initials: "EO" },
      { id: 2, name: "Uber Rides", type: "Payment", amount: -12.50, time: "8:30 AM", initials: "U" },
    ]
  },
  {
    title: "Yesterday",
    items: [
      { id: 3, name: "Netflix", type: "Subscription", amount: -15.99, time: "4:00 PM", initials: "N" },
    ]
  },
  {
    title: "October 24",
    items: [
      { id: 4, name: "Chioma A.", type: "Sent", amount: -120.00, time: "10:23 AM", initials: "CA" },
      { id: 5, name: "Binance Deposit", type: "Add Cash", amount: 500.00, time: "9:15 AM", initials: "B" },
    ]
  }
];

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-20 transition-colors duration-300">
        
        {/* Header */}
        <header className="fixed top-0 w-full max-w-[1080px] bg-[#F6EDFF]/90 dark:bg-[#252525]/90 backdrop-blur-md z-40 px-6 py-5 flex items-center justify-between border-b border-transparent dark:border-[#3d3d3d]">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">Activity</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors">
            <FunnelIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="mt-24 px-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#3d3d3d] rounded-2xl border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#D364DB] shadow-sm"
            />
          </div>
        </div>

        {/* Timeline List */}
        <div className="px-6 space-y-8">
          {HISTORY.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.items.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#404040] rounded-2xl border border-slate-100 dark:border-[#A3A3A3] shadow-sm">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-slate-100 dark:border-[#A3A3A3]">
                        <AvatarFallback className="bg-slate-100 dark:bg-[#3d3d3d] text-slate-600 dark:text-gray-300 font-bold text-xs">
                          {tx.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.name}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{tx.type} • {tx.time}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
