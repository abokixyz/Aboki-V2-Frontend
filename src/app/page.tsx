import BalanceCard from "@/components/dashboard/BalanceCard";
import ActionGrid from "@/components/dashboard/ActionGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { BellIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header / Top Nav */}
      <header className="flex items-center justify-between p-6 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">AB</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Aboki</span>
        </div>
        <div className="flex items-center gap-4">
          <BellIcon className="w-6 h-6 text-slate-600" />
          <Cog6ToothIcon className="w-6 h-6 text-slate-600" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 space-y-2">
        <BalanceCard />
        <ActionGrid />
        <RecentActivity />
      </div>
    </main>
  );
}
