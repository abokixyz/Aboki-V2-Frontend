import { 
  PaperAirplaneIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  QrCodeIcon 
} from "@heroicons/react/24/solid";

export default function ActionGrid() {
  const actions = [
    { label: "Send", icon: PaperAirplaneIcon, color: "bg-pink-500 text-white" },
    { label: "Add", icon: PlusIcon, color: "bg-white text-black border border-gray-200" },
    { label: "Withdraw", icon: ArrowDownTrayIcon, color: "bg-white text-black border border-gray-200" },
    { label: "Request", icon: QrCodeIcon, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 my-6">
      {actions.map((action) => (
        <div key={action.label} className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${action.color}`}>
            <action.icon className="w-7 h-7 -rotate-45" />
          </div>
          <span className="text-xs font-medium text-slate-600">{action.label}</span>
        </div>
      ))}
    </div>
  );
}
