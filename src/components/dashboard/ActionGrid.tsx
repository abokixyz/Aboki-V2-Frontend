import { 
  PaperAirplaneIcon, 
  ArrowDownLeftIcon, 
  PlusIcon, 
  BuildingLibraryIcon 
} from "@heroicons/react/24/outline";

export default function ActionGrid() {
  const actions = [
    { 
      label: "Send", 
      icon: PaperAirplaneIcon, 
      // Deep purple shadow for the primary button
      style: "bg-[#9333EA] border-[#9333EA] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
    },
    { 
      label: "Receive", 
      icon: ArrowDownLeftIcon, 
      // Distinct gray shadow for secondary buttons
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md shadow-slate-200/50 dark:shadow-none hover:shadow-lg hover:-translate-y-0.5"
    },
    { 
      label: "Add Cash", 
      icon: PlusIcon, 
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md shadow-slate-200/50 dark:shadow-none hover:shadow-lg hover:-translate-y-0.5"
    },
    { 
      label: "Withdraw", 
      icon: BuildingLibraryIcon, 
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md shadow-slate-200/50 dark:shadow-none hover:shadow-lg hover:-translate-y-0.5"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {actions.map((action) => (
        <button 
          key={action.label}
          className={`
            flex items-center justify-center md:justify-start gap-3 p-4 
            rounded-full border transition-all duration-300
            ${action.style}
          `}
        >
          <div className={`p-2 rounded-full ${action.label === 'Send' ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
            <action.icon className={`w-5 h-5 ${action.label === 'Send' ? 'text-white' : 'text-slate-900 dark:text-white'}`} />
          </div>
          
          <span className="font-bold text-sm">{action.label}</span>
        </button>
      ))}
    </div>
  );
}