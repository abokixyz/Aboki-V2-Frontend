"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeftIcon, DocumentDuplicateIcon, ShareIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

export default function ReceiveAddress() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getUserProfile();
        
        if (response.success && response.data) {
          const address = response.data.wallet.smartAccountAddress;
          setWalletAddress(address);
          setNetwork(response.data.wallet.network);
          
          // Generate QR code
          generateQRCode(address);
        } else {
          setError(response.error || "Failed to load wallet");
        }
      } catch (err) {
        setError("Failed to load wallet");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const generateQRCode = async (address: string) => {
    if (!qrCanvasRef.current) return;
    
    try {
      // Dynamically import QRCode library
      const QRCode = (await import('qrcode')).default;
      
      await QRCode.toCanvas(qrCanvasRef.current, address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!walletAddress) return;

    const shareData = {
      title: 'My Wallet Address',
      text: `Send USDC to my wallet on ${network}`,
      url: walletAddress
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        handleCopy();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D364DB] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex flex-col">
        <header className="px-6 py-6 flex items-center gap-4">
          <Link href="/receive" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">Wallet Address</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#D364DB] text-white font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      <header className="px-6 py-6 flex items-center gap-4 relative">
        <Link href="/receive" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Wallet Address</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6 gap-8">
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800/50">
          <InformationCircleIcon className="w-4 h-4" />
          <span>Only send USDC on {network} Network</span>
        </div>

        <div className="bg-white dark:bg-[#3D3D3D] p-6 rounded-[2.5rem] shadow-xl shadow-purple-100/50 dark:shadow-none border-2 border-slate-100 dark:border-[#A3A3A3] flex flex-col items-center gap-6 w-full max-w-xs">
          <div className="relative">
            <canvas 
              ref={qrCanvasRef}
              className="rounded-3xl shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-white dark:bg-[#3D3D3D] rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 rounded-full bg-[#D364DB]" />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-1 w-full">
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Your Address</p>
            <p className="text-slate-900 dark:text-white font-mono text-lg font-bold tracking-tight">
              {formatAddress(walletAddress)}
            </p>
            <p className="text-slate-400 text-xs font-mono truncate px-2">
              {walletAddress}
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-xs">
          <button 
            onClick={handleCopy} 
            className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] flex items-center justify-center gap-2 hover:border-[#D364DB] active:scale-95 transition-all shadow-sm"
          >
            {copied ? (
              <span className="text-green-600 font-bold text-sm">✓ Copied!</span>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-slate-700 dark:text-white text-sm">Copy</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-[#D364DB] text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-all"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}