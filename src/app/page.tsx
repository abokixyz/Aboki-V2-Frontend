"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActionGrid from "@/components/dashboard/ActionGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ScanSection from "@/components/dashboard/ScanSection";
import { BellIcon, MoonIcon, SunIcon, StarIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  // ✅ Use the auth context instead of duplicate checking
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Redirect if not authenticated (auth-context handles this, but be explicit)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state during hydration and auth check
  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">
            Loading your wallet...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    logout();
  };

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-32 transition-colors duration-300 overflow-hidden relative">
        
        {/* Header */}
        <header className="fixed top-0 w-full max-w-[1080px] flex items-center justify-between px-6 py-5 bg-[#F6EDFF]/80 dark:bg-[#252525]/90 backdrop-blur-md z-40 border-b border-transparent dark:border-[#3d3d3d]">
          {/* Logo */}
          <div className="relative h-8 w-32 cursor-pointer" onClick={() => router.push("/")}>
            <Image 
              src="/LogoLight.svg" 
              alt="Aboki Logo" 
              fill 
              className="object-contain object-left dark:hidden" 
              priority 
            />
            <Image 
              src="/LogoDark.svg" 
              alt="Aboki Logo" 
              fill 
              className="object-contain object-left hidden dark:block" 
              priority 
            />
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Points */}
            <button 
              onClick={() => alert("Points feature coming soon! 🎉")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-full text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20 transition-all hover:scale-105 active:scale-95"
              title="Reward Points - Coming Soon"
            >
              <StarIcon className="w-4 h-4" />
              <span className="text-xs font-bold">120 pts</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-all hover:scale-105 active:scale-95"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <SunIcon className="w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="w-5 h-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-all hover:scale-105 active:scale-95"
                title="Notifications"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-[#252525]" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-900/20 p-4 animate-slide-down">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-purple-100">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-600 dark:text-purple-100/60 hover:text-gray-900 dark:hover:text-purple-100"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-[#252525] rounded-xl">
                      <p className="text-sm text-gray-900 dark:text-purple-100 font-medium">Welcome to Aboki! 🎉</p>
                      <p className="text-xs text-gray-600 dark:text-purple-100/60 mt-1">Your wallet is ready to use</p>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-purple-100/50">No new notifications</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#D364DB] to-[#C554CB] text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                title="Account"
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-900/20 p-4 animate-slide-down">
                  <div className="pb-4 border-b border-purple-200/50 dark:border-purple-900/20">
                    <p className="font-bold text-gray-900 dark:text-purple-100">{user?.name}</p>
                    <p className="text-xs text-gray-600 dark:text-purple-100/60">{user?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/profile");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-[#252525] text-gray-900 dark:text-purple-100 text-sm transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-[#252525] text-gray-900 dark:text-purple-100 text-sm transition-colors"
                    >
                      Security
                    </button>
                  </div>

                  <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/20">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-6 mt-6 pt-20 flex flex-col gap-6">
          <div className="space-y-4">
            <BalanceCard />
            <ScanSection />
          </div>
          <ActionGrid />
          <RecentActivity />
        </div>
      </main>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}