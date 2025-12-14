"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  ArrowLeftIcon,
  UsersIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ShareIcon,
  MoonIcon,
  SunIcon
} from "@heroicons/react/24/outline";

interface Referral {
  name: string;
  username: string;
  email: string;
  joinedAt: string;
  hasWallet: boolean;
}

export default function ReferralsPage() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    const token = localStorage.getItem("aboki_auth_token");
    
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch("https://apis.aboki.xyz/api/invites/my-referrals", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferrals(data.data.referrals || []);
        setTotalReferrals(data.data.totalReferrals || 0);
        setInviteCode(data.data.myInviteCode || "");
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = () => {
    const link = `https://aboki.xyz/invite/${inviteCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Aboki',
        text: `Use my invite code: ${inviteCode}`,
        url: link
      });
    } else {
      navigator.clipboard.writeText(link);
      alert("Invite link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6EDFF] dark:bg-[#252525] flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6EDFF] dark:bg-[#252525] pb-32">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F6EDFF]/80 dark:bg-[#252525]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#3d3d3d]">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Left: Back button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#3d3d3d] transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <div className="relative h-7 w-28 cursor-pointer" onClick={() => router.push("/")}>
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
          </div>

          {/* Right: Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-all hover:scale-105 active:scale-95"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <SunIcon className="w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="w-5 h-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        
        {/* Page Title */}
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Your Referrals
        </h1>
        
        {/* Invite Code Card */}
        <div className="bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl p-6 text-white">
          <h3 className="text-sm font-bold mb-3 opacity-90">Your Invite Code</h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl md:text-3xl font-black tracking-wider break-all">
                {inviteCode}
              </p>
              <button
                onClick={copyInviteCode}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title={copied ? "Copied!" : "Copy code"}
              >
                {copied ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  <ClipboardDocumentIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={shareInvite}
            className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share Invite Link
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-[#D364DB]" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {totalReferrals}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalReferrals === 1 ? 'Total referral' : 'Total referrals'}
              </p>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-12 text-center border border-gray-200 dark:border-[#3d3d3d]">
            <UsersIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold mb-2">
              No referrals yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Share your invite code to start inviting friends!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 px-2">
              PEOPLE YOU INVITED ({referrals.length})
            </h3>
            
            {referrals.map((referral, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d] hover:border-[#D364DB] dark:hover:border-[#D364DB] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D364DB] to-[#C554CB] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {referral.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {referral.name}
                    </p>
                    <p className="text-sm text-[#D364DB] truncate">
                      @{referral.username}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(referral.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    {referral.hasWallet && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        ✓ Active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}