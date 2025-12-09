import Image from "next/image";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActionGrid from "@/components/dashboard/ActionGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ScanSection from "@/components/dashboard/ScanSection";
import { BellIcon, Cog6ToothIcon, StarIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header / Top Nav */}
      <header className="flex items-center justify-between p-6 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
        {/* Logo Lockup */}
        <div className="relative h-8 w-32">
          <Image 
            src="/Logo lockup.svg" 
            alt="Aboki Logo" 
            fill 
            className="object-contain object-left" 
            priority
          />
        </div>
        
        {/* Icons: Points, Noti, Settings */}
        <div className="flex items-center gap-4">
          <button className="text-slate-600 hover:text-purple-600 transition">
            <StarIcon className="w-6 h-6" /> {/* Points Icon */}
          </button>
          <button className="text-slate-600 hover:text-slate-900 transition relative">
            <BellIcon className="w-6 h-6" />
            {/* Notification dot indicating unseen items */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button className="text-slate-600 hover:text-slate-900 transition">
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 space-y-4">
        <BalanceCard />
        <ScanSection />
        <ActionGrid />
        <RecentActivity />
      </div>
    </main>
  );
}
