"use client"
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#D364DB] flex items-center justify-center p-6 text-center text-white animate-in fade-in">
      <div className="max-w-md w-full flex flex-col items-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Deposit Pending</h1>
        <p className="text-lg opacity-90 mb-8">
          We are confirming your transfer. Your wallet will be credited in ~2 minutes.
        </p>
        <Link href="/" className="w-full">
          <button className="w-full py-4 bg-white text-[#D364DB] font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}