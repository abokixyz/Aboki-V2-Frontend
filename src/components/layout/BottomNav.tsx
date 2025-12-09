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
