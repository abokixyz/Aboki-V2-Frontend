"use client" // Needed for the Theme Toggle interaction

import Image from "next/image";
import { useTheme } from "next-themes";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActionGrid from "@/components/dashboard/ActionGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ScanSection from "@/components/dashboard/ScanSection";
import { BellIcon, MoonIcon, SunIcon, StarIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { setTheme, theme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-20">
        
        {/* Smaller Logo */}
        <div className="relative h-6 w-24">
          <Image 
            src="/Logo lockup.svg" 
            alt="Aboki Logo" 
            fill 
            className="object-contain object-left dark:invert" // Invert logo color in dark mode if needed
            priority
          />
        </div>
        
        <div className="flex items-center gap-5">
          {/* Points System with Text */}
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#9333ea]/20 rounded-full  dark:text-[9333EA] hover:bg-[9333EA]/40 transition">
            <StarIcon className="w-4 h-4" />
            <span className="text-xs font-bold">120 pts</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <SunIcon className="w-6 h-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 hidden dark:block" />
            <MoonIcon className="w-6 h-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 block dark:hidden" />
            {/* Simple fallback if animation is tricky: just show icon based on state */}
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>

          {/* Notifications */}
          <button className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-slate-950" />
          </button>
        </div>
      </header>

      {/* Body Content with specific margins */}
      <div className="px-6 mt-2 flex flex-col gap-6">
        
        {/* Balance & Scan Group */}
        <div className="space-y-4">
          <BalanceCard />
          <ScanSection />
        </div>

        {/* Actions (Single Line) */}
        <ActionGrid />

        {/* Activity (Margin handled in component, but flex gap helps too) */}
        <RecentActivity />
        
      </div>
    </main>
  );
}