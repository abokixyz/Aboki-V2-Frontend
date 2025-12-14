"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  ShareIcon,
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  MoonIcon,
  SunIcon
} from "@heroicons/react/24/outline";

interface UserProfile {
  name: string;
  username: string;
  email: string;
  wallet?: {
    ownerAddress: string;
    smartAccountAddress: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem("aboki_auth_token");
    
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      // Fetch user profile
      const profileRes = await fetch("https://apis.aboki.xyz/api/users/me", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.data);
      }

      // Fetch invite code
      const inviteRes = await fetch("https://apis.aboki.xyz/api/invites/my-code", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInviteCode(inviteData.data.code);
      }

      // Fetch referrals count
      const referralsRes = await fetch("https://apis.aboki.xyz/api/invites/my-referrals", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setTotalReferrals(referralsData.data.totalReferrals || 0);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aboki_auth_token");
    localStorage.removeItem("aboki_user_email");
    localStorage.removeItem("aboki_auth_method");
    router.push("/auth");
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInviteLink = () => {
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

          {/* Theme Toggle */}
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

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        
        {/* Header with username link */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d] text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            aboki.xyz/@{user?.username}
          </p>
        </div>

        {/* Invite Friends - Two Buttons */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Share Link */}
          <button
            onClick={shareInviteLink}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Share invite link
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Copy Invite Code */}
          <button
            onClick={copyInviteCode}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5 text-[#D364DB]" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">
                  {copied ? "Copied!" : "Copy invite code"}
                </p>
                {inviteCode && (
                  <p className="text-xs text-[#D364DB] font-mono">
                    {inviteCode}
                  </p>
                )}
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Group */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Your Referrals */}
          <button 
            onClick={() => router.push("/referrals")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Your Referrals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D364DB] font-bold">{totalReferrals}</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Points */}
          <button 
            onClick={() => alert("Points feature coming soon! 🎉")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">Coming Soon</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Settings Group */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Personal Details */}
          <button 
            onClick={() => alert("Personal details editing coming soon! 🎉")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Personal details
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Security & Verification */}
          <button 
            onClick={() => alert("Security settings coming soon! 🔒")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Security & Verification
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Show Full Name Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <span className="text-lg">👁</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Show my full name
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#D364DB]"></div>
            </label>
          </div>
        </div>

        {/* Exchange Rates */}
        <button 
          onClick={() => alert("Exchange rates feature coming soon! 💱")}
          className="w-full bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-[#D364DB]" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Exchange rates and fees
            </span>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border-2 border-gray-900 dark:border-white flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-900 dark:text-white" />
          <span className="font-bold text-gray-900 dark:text-white">
            Log out
          </span>
        </button>

      </div>
    </div>
  );
}