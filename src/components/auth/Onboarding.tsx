"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import AuthLayout from "./AuthLayout";

export default function Onboarding() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <AuthLayout>
      <div className="space-y-8">
        
        {/* Header Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            GET STARTED
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Send, Receive, and Spend. No seed phrases.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Sign Up -> Goes to Referral Page */}
          <Link href={isChecked ? "/signup" : "#"}>
            <button 
              disabled={!isChecked}
              className="w-full py-5 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Create Account
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <button 
              disabled={!isChecked}
              className="w-full py-5 rounded-2xl bg-white dark:bg-[#252525] text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            I have an account
          </button>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3 mt-8">
          <button 
            onClick={() => setIsChecked(!isChecked)}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-[#D364DB] border-[#D364DB]' : 'border-slate-300 dark:border-slate-500 bg-transparent'}`}
          >
            {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
          </button>
          <p className="text-xs text-slate-400 leading-relaxed select-none" onClick={() => setIsChecked(!isChecked)}>
            By checking this box, you agree to our <span className="underline hover:text-purple-500">Terms</span> & <span className="underline hover:text-purple-500">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
