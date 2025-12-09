"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  XMarkIcon, 
  BoltIcon, 
  PhotoIcon,
  QrCodeIcon 
} from "@heroicons/react/24/outline";

export default function ScanScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [flash, setFlash] = useState(false);

  // Mock "Scan Success" Logic
  const handleSimulateScan = () => {
    setScanning(false);
    // Simulate finding "@chioma"
    setTimeout(() => {
      router.push("/send/amount?username=@chioma&avatar=C&source=scan");
    }, 500);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-black text-white relative flex flex-col items-center justify-between overflow-hidden">
      
      {/* 1. Camera Feed Simulation (Gray Background) */}
      <div className="absolute inset-0 bg-gray-900 opacity-50 z-0">
         {/* In a real app, <video> element goes here */}
      </div>

      {/* 2. Top Bar (Controls) */}
      <header className="w-full px-6 py-8 flex items-center justify-between relative z-20">
        <Link href="/">
           <button className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
             <XMarkIcon className="w-6 h-6 text-white" />
           </button>
        </Link>
        
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-sm font-bold tracking-wide">Scan Code</span>
        </div>

        <button 
           onClick={() => setFlash(!flash)}
           className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all ${flash ? 'bg-yellow-400 text-black' : 'bg-black/40 text-white hover:bg-white/20'}`}
        >
           <BoltIcon className="w-6 h-6" />
        </button>
      </header>

      {/* 3. The Viewfinder (Center) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        
        {/* Helper Text */}
        <p className="mb-8 text-white/80 font-medium text-sm animate-pulse">
          Align QR code within frame
        </p>

        {/* Frame */}
        <div className="relative w-72 h-72 rounded-[2.5rem] border-4 border-white/30 overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
          
          {/* Corner Accents (Aboki Purple) */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D364DB] rounded-tl-[2rem]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#D364DB] rounded-tr-[2rem]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#D364DB] rounded-bl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D364DB] rounded-br-[2rem]" />

          {/* Scanning Laser Animation */}
          <div className="absolute inset-x-0 h-1 bg-[#D364DB] shadow-[0_0_20px_#D364DB] animate-[scan_2s_infinite_ease-in-out]" />
          
          {/* MOCK SCAN TRIGGER (Clicking box simulates scan) */}
          <button 
            onClick={handleSimulateScan}
            className="absolute inset-0 w-full h-full cursor-pointer z-50 opacity-0" 
            title="Click to simulate scan"
          />
        </div>

        {/* Hint for Dev */}
        <p className="mt-8 text-xs text-white/40 font-mono">
          [Tap box to simulate scan]
        </p>

      </div>

      {/* 4. Bottom Actions */}
      <footer className="w-full p-8 relative z-20 pb-12 flex items-center justify-center gap-6">
         
         {/* Upload from Gallery */}
         <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-white/60">Upload</span>
         </button>

         {/* My Code (Goes to Receive) */}
         <Link href="/receive/address">
           <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full bg-[#D364DB] flex items-center justify-center shadow-[0_0_20px_rgba(211,100,219,0.4)] hover:scale-110 transition-transform">
                <QrCodeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-white">My Code</span>
           </button>
         </Link>

      </footer>

      {/* Global Style for Scan Animation */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
