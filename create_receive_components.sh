#!/bin/bash

# Create directory if not exi

# 1. Clear Next.js Cache (The most likely culprit for 404s)
rm -rf .next

# 2. Restore src/app/send/review/page.tsx
cat << 'EOF' > src/app/send/review/page.tsx
import ReviewPayment from "@/components/send/ReviewPayment";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <ReviewPayment />
    </div>
  );
}
EOF

# 3. Restore src/components/auth/Onboarding.tsx
cat << 'EOF' > src/components/auth/Onboarding.tsx
"use client"

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Onboarding() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F6EDFF]/30 dark:bg-[#252525] transition-colors duration-300">
      
      {/* SECTION 1: VISUALS */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 animate-pulse" />

        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8 animate-bounce-custom">
          <div className="w-full h-full bg-[#D364DB] rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3">
             <span className="text-white font-bold text-5xl md:text-7xl">ab</span>
          </div>
        </div>

        <div className="text-center space-y-3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Aboki V2</h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-xs mx-auto">
            Crypto without the headache.<br />Send, Receive, and Spend.
          </p>
        </div>
      </div>

      {/* SECTION 2: ACTIONS */}
      <div className="flex-1 bg-white dark:bg-[#3d3d3d] flex flex-col items-center justify-center p-8 md:p-16 rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-l border-slate-100 dark:border-[#A3A3A3]">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Get Started</h2>
            <p className="text-slate-400 text-sm">Create a smart wallet in seconds. No seed phrases.</p>
          </div>

          <div className="space-y-4">
            <button className="w-full py-5 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 group">
              Create Account
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full py-5 rounded-2xl bg-white dark:bg-[#252525] text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all">
              I have an account
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            By continuing, you agree to our <span className="underline cursor-pointer hover:text-purple-500">Terms</span> & <span className="underline cursor-pointer hover:text-purple-500">Privacy Policy</span>.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes custom-bounce {
          0%, 100% { transform: translateY(-5%) rotate(3deg); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(5%) rotate(-3deg); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-custom { animation: custom-bounce 3s infinite; }
      `}</style>
    </div>
  );
}
EOF

# 4. Restore src/app/page.tsx (Dashboard)
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

# 5. Restore src/app/login/page.tsx
cat << 'EOF' > src/app/login/page.tsx
import Onboarding from "@/components/auth/Onboarding";

export default function Page() {
  return <Onboarding />;
}
EOF

# 6. Restore src/app/layout.tsx
cat << 'EOF' > src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Aboki V2",
  icons: { icon: "/abokiicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] font-sans antialiased transition-colors duration-300">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF
