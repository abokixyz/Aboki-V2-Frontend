"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, DocumentDuplicateIcon, ShareIcon } from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

interface UserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  wallet: {
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  };
  createdAt: string;
}

export default function ReceiveUsername() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  // ✅ Fetch user details on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Call the API to get current user details
        const response = await apiClient.getUserProfile();
        
        if (response.success && response.data) {
          console.log("✅ User data fetched:", response.data);
          setUserData(response.data);
        } else {
          throw new Error(response.error || "Failed to fetch user data");
        }
      } catch (err: any) {
        console.error("❌ Error fetching user data:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCopy = () => {
    if (!userData?.username) return;
    
    // Copy username without @ symbol
    navigator.clipboard.writeText(userData.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!userData) return;

    // Extract avatar (first letter of name)
    const avatar = userData.name.charAt(0).toUpperCase();
    
    // Build share URL
    const shareUrl = `${window.location.origin}/send/amount?username=${encodeURIComponent(userData.username)}&avatar=${encodeURIComponent(avatar)}&source=contacts`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    
    // Show feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    console.log("📤 Share URL:", shareUrl);

    // Optional: Open share dialog if available (Web Share API)
    if (navigator.share) {
      navigator.share({
        title: "Pay me on Aboki",
        text: `Send money to ${userData.name}`,
        url: shareUrl,
      }).catch(err => console.log("Share cancelled:", err));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
        <header className="px-6 py-6 flex items-center gap-4 relative z-10">
          <Link 
            href="/receive" 
            className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">Aboki Username</h1>
        </header>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400 font-bold">{error || "Failed to load user data"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-[#D364DB] text-white font-bold hover:bg-[#C554CB] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract avatar (first letter of name)
  const avatar = userData.name.charAt(0).toUpperCase();
  const displayUsername = `@${userData.username}`;

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 relative z-10">
        <Link 
          href="/receive" 
          className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Aboki Username</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-[#A3A3A3] shadow-xl">
          <span className="text-3xl font-bold text-purple-700">{avatar}</span>
        </div>
        
        {/* Label */}
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">YOUR USERNAME</h2>
        
        {/* Username Display */}
        <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {displayUsername}
        </div>

        {/* User Name (for context) */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {userData.name}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] flex items-center justify-center gap-2 hover:border-[#D364DB] active:scale-95 transition-all shadow-sm font-bold"
          >
            {copied ? (
              <span className="text-green-600">✓ Copied!</span>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-slate-700 dark:text-white">Copy</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-[#D364DB] text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}