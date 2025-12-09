import { 
  PaperAirplaneIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  QrCodeIcon 
} from "@heroicons/react/24/solid";

export default function ActionGrid() {
  const actions = [
    { label: "Send", icon: PaperAirplaneIcon, color: "text-pink-500" },
    { label: "Receive", icon: QrCodeIcon, color: "text-purple-500" },
    { label: "Add", icon: PlusIcon, color: "text-blue-500" },
    { label: "Withdraw", icon: ArrowDownTrayIcon, color: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 my-6">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.98]"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 ${action.color}`}>
            <action.icon className="w-5 h-5 -rotate-45" />
          </div>
          <span className="font-bold text-slate-900">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
