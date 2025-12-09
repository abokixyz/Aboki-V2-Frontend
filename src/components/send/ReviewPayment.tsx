"use client"

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ShieldCheckIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get data from URL
  const username = searchParams.get("username") || "@unknown";
  const amount = searchParams.get("amount") || "0";
  const note = searchParams.get("note") || "";

  // Hold Button State
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSent, setIsSent] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION = 1500; // 1.5 seconds to confirm

  // Handle Hold Logic
  const startHold = () => {
    if (isSent) return;
    setIsHolding(true);
  };

  const endHold = () => {
    if (isSent) return;
    setIsHolding(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHolding && !isSent) {
      const step = 100 / (HOLD_DURATION / 20); // updates every 20ms
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Success!
            setIsSent(true);
            setIsHolding(false);
            clearInterval(interval);
            return 100;
          }
          return prev + step;
        });
      }, 20);
    } else {
      // Reset if user lets go early
      if (!isSent) {
        setProgress(0);
      }
    }

    return () => clearInterval(interval);
  }, [isHolding, isSent]);


  // If Sent, show Success Screen (Optimistic UI)
  if (isSent) {
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#D364DB] flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Sent!</h1>
        <p className="text-lg opacity-90 mb-8">
          You sent ${amount} to {username}
        </p>
        
        <Link href="/">
          <button className="px-8 py-3 bg-white text-[#D364DB] font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
            Done
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-center relative">
        <Link 
          href="/send/amount" 
          className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Review</h1>
      </header>

      <div className="flex-1 px-6 mt-4">
        
        {/* Receipt Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          
          {/* Main Amount */}
          <div className="text-center py-6 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-400 tracking-wider">YOU SEND</span>
            <div className="text-5xl font-bold text-slate-900 dark:text-white mt-2 tracking-tighter">
              ${amount}<span className="text-3xl text-slate-400">.00</span>
            </div>
          </div>

          {/* Details */}
          <div className="py-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">To</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                  {username[1]?.toUpperCase() || "U"}
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{username}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Network Fee</span>
              <span className="font-bold text-green-500">Free</span>
            </div>

            {note && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Note</span>
                <span className="font-medium text-slate-900 dark:text-white max-w-[150px] truncate">{note}</span>
              </div>
            )}

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-bold text-slate-900 dark:text-white">${amount}.00</span>
            </div>

          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Secured by Coinbase Smart Wallet</span>
        </div>

      </div>

      {/* Hold Button Area */}
      <div className="p-6 pb-10">
        <div className="relative w-full h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden select-none touch-none shadow-inner">
          
          {/* Progress Fill */}
          <div 
            className="absolute top-0 left-0 h-full bg-[#D364DB] transition-all duration-[20ms] ease-linear"
            style={{ width: `${progress}%` }}
          />

          {/* Button Interaction Layer */}
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="absolute inset-0 w-full h-full flex items-center justify-center z-10 focus:outline-none"
          >
            <span className={`font-bold text-lg transition-colors ${progress > 50 ? 'text-white' : 'text-slate-500'}`}>
              {isHolding ? "Keep holding..." : "Hold to Send"}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}

// Suspense Wrapper for SearchParams
export default function ReviewPayment() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
