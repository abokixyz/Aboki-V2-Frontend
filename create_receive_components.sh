#!/bin/bash

# Create directory if not exi
cat << 'EOF' > src/components/layout/BottomNav.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  GiftIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon 
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeSolid, 
  GiftIcon as GiftSolid, 
  ChatBubbleLeftRightIcon as ChatSolid, 
  UserIcon as UserSolid,
  QrCodeIcon
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide Nav on the active Scan camera view
  if (pathname === "/scan") return null;

  const navItems = [
    { label: "Home", href: "/", icon: HomeIcon, activeIcon: HomeSolid },
    { label: "Rewards", href: "/rewards", icon: GiftIcon, activeIcon: GiftSolid },
    { label: "SCAN", href: "/scan", isFloating: true }, // Middle Button
    { label: "Support", href: "/support", icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid },
    { label: "Profile", href: "/profile", icon: UserIcon, activeIcon: UserSolid },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[1080px] pointer-events-auto">
        
        {/* Glass Container */}
        <nav className="relative bg-white/90 dark:bg-[#3d3d3d]/90 backdrop-blur-xl border-t border-slate-200 dark:border-[#A3A3A3] pb-6 pt-2 px-6 shadow-2xl rounded-t-[2.5rem]">
          
          <ul className="flex items-center justify-between">
            {navItems.map((item) => {
              
              // 1. BIG SCAN BUTTON (Floating)
              if (item.isFloating) {
                return (
                  <li key="scan" className="relative -top-10">
                    <Link href="/scan">
                      <div className="group w-20 h-20 rounded-full bg-[#D364DB] flex items-center justify-center border-4 border-[#FDFBF7] dark:border-[#252525] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]">
                        <QrCodeIcon className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </Link>
                  </li>
                );
              }

              // 2. Standard Tabs with Animation
              const isActive = pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;

              return (
                <li key={item.label} className="relative">
                  <Link href={item.href} className="flex flex-col items-center gap-1 p-2 group">
                    <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`}>
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-[#D364DB] scale-110' : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-600 dark:group-hover:text-gray-200'}`} />
                    </div>
                    <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-[#D364DB] opacity-100' : 'text-slate-400 dark:text-gray-400 opacity-80'}`}>
                      {item.label}
                    </span>
                    
                    {/* Active Indicator Dot */}
                    <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-[#D364DB] transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
EOF


cat << 'EOF' > src/components/dashboard/ActionGrid.tsx
import Link from "next/link";
import { 
  PaperAirplaneIcon, 
  ArrowDownLeftIcon, 
  PlusIcon
} from "@heroicons/react/24/outline";

export default function ActionGrid() {
  return (
    <div className="flex flex-col gap-6 my-6">
      
      {/* 1. Add Cash (Small, Centered, Elaborate Margin) */}
      <div className="flex justify-center mb-2">
        <Link href="/add">
          <button className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-[#3d3d3d] rounded-full border border-slate-200 dark:border-[#A3A3A3] shadow-sm hover:border-[#D364DB] transition-all active:scale-95 group">
            <div className="p-1 rounded-full bg-slate-100 dark:bg-[#252525] group-hover:bg-purple-100 transition-colors">
              <PlusIcon className="w-3 h-3 text-slate-600 dark:text-white group-hover:text-[#D364DB]" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-gray-200 group-hover:text-[#D364DB]">
              Add Cash
            </span>
          </button>
        </Link>
      </div>

      {/* 2. Send & Receive (Prominent Grid) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Send Button */}
        <Link href="/send" className="w-full">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-200 bg-[#D364DB] text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]">
            <div className="p-2 rounded-full bg-white/20">
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">Send</span>
          </button>
        </Link>

        {/* Receive Button */}
        <Link href="/receive" className="w-full">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-200 bg-white dark:bg-[#3d3d3d] text-slate-900 dark:text-white border-2 border-slate-900 dark:border-[#A3A3A3] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]">
            <div className="p-2 rounded-full bg-slate-100 dark:bg-[#252525]">
              <ArrowDownLeftIcon className="w-5 h-5 text-slate-900 dark:text-white" />
            </div>
            <span className="font-bold text-sm">Receive</span>
          </button>
        </Link>

      </div>
    </div>
  );
}
EOF

cat << 'EOF' > src/app/page.tsx
"use client"

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
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-32 transition-colors duration-300 overflow-hidden relative">
        
        {/* FIXED Header */}
        <header className="fixed top-0 w-full max-w-[1080px] flex items-center justify-between px-6 py-5 bg-[#F6EDFF]/80 dark:bg-[#252525]/90 backdrop-blur-md z-40 border-b border-transparent dark:border-[#3d3d3d]">
          
          <div className="relative h-8 w-32">
            <Image src="/LogoLight.svg" alt="Aboki Logo" fill className="object-contain object-left dark:hidden" priority />
            <Image src="/LogoDark.svg" alt="Aboki Logo" fill className="object-contain object-left hidden dark:block" priority />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-full text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20 transition">
              <StarIcon className="w-4 h-4" />
              <span className="text-xs font-bold">120 pts</span>
            </button>

            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-colors"
            >
              <SunIcon className="w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="w-5 h-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            </button>

            <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-[#252525]" />
            </button>
          </div>
        </header>

        {/* Content Body (Added padding-top for fixed header) */}
        <div className="px-6 mt-6 pt-20 flex flex-col gap-6">
          <div className="space-y-4">
            <BalanceCard />
            <ScanSection />
          </div>
          <ActionGrid />
          <RecentActivity />
        </div>

      </main>
    </div>
  );
}
EOF
