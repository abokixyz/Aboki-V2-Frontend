import Link from "next/link";
import { QrCodeIcon } from "@heroicons/react/24/solid";

export default function ScanSection() {
  return (
    <Link href="/scan" className="w-full">
      <button className="
        w-full flex items-center justify-center gap-3 
        bg-[#D364DB] 
        text-white p-4 rounded-2xl shadow-sm 
        hover:opacity-90 transition-opacity active:scale-[0.98]
      ">
        <QrCodeIcon className="w-6 h-6 text-white" />
        <span className="font-bold text-lg">Scan code</span>
      </button>
    </Link>
  );
}
