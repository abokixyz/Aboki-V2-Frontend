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
