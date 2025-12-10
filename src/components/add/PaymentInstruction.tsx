"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  DocumentDuplicateIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

export default function PaymentInstruction() {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);

  // Mock Bank Details
  const ACCOUNT_DETAILS = {
    bankName: "VFD Microfinance Bank",
    accountNumber: "4012399821",
    accountName: "Aboki / Jadonamite",
    amount: "₦20,000"
  };

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-20 transition-colors duration-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center gap-4 relative">
          <Link href="/add" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            Make Transfer
          </h1>
        </header>

        <div className="flex-1 px-6 flex flex-col items-center">
          
          {/* Timer Card */}
          <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full flex items-center gap-2 mb-8 font-bold text-sm border border-orange-100 dark:border-orange-800/50">
             <ClockIcon className="w-4 h-4" />
             <span>Expires in {formatTime(timeLeft)}</span>
          </div>

          {/* Amount Display */}
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-1">Transfer exactly</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">{ACCOUNT_DETAILS.amount}</h2>

          {/* Bank Details Card */}
          <div className="w-full bg-white dark:bg-[#404040] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-[#A3A3A3] space-y-6">
             
             {/* Bank Name */}
             <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#A3A3A3] pb-4">
                <span className="text-slate-500 text-sm font-bold">Bank Name</span>
                <span className="text-slate-900 dark:text-white font-bold text-lg">{ACCOUNT_DETAILS.bankName}</span>
             </div>

             {/* Account Number */}
             <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#A3A3A3] pb-4">
                <span className="text-slate-500 text-sm font-bold">Account No</span>
                <div className="flex items-center gap-3">
                   <span className="text-slate-900 dark:text-white font-mono font-bold text-2xl tracking-widest">
                     {ACCOUNT_DETAILS.accountNumber}
                   </span>
                   <button onClick={handleCopy} className="p-2 bg-slate-100 dark:bg-[#3d3d3d] rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
                     {copied ? <span className="text-green-500 font-bold text-xs">Copied</span> : <DocumentDuplicateIcon className="w-5 h-5 text-slate-500 group-hover:text-[#D364DB]" />}
                   </button>
                </div>
             </div>

             {/* Account Name */}
             <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-bold">Beneficiary</span>
                <span className="text-slate-900 dark:text-white font-bold">{ACCOUNT_DETAILS.accountName}</span>
             </div>

          </div>

          {/* Warning */}
          <div className="mt-6 flex gap-3 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
             <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0" />
             <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
               This is a temporary account. Do not save it as a beneficiary. Transfer the exact amount to avoid delays.
             </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-6 pb-24">
           <Link href="/add/success">
             <button className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all">
               I have sent the money
             </button>
           </Link>
        </div>

      </main>
    </div>
  );
}
