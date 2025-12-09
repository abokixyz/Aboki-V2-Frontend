import { 
  PaperAirplaneIcon, 
  ArrowDownLeftIcon, 
  PlusIcon, 
  BuildingLibraryIcon 
} from "@heroicons/react/24/outline";

// Scalable Data Structure
interface ActionItem {
  label: string;
  icon: React.ElementType;
  actionId: string; // Used for future click handlers
}

const actions: ActionItem[] = [
  { label: "Send", icon: PaperAirplaneIcon, actionId: "send" },
  { label: "Receive", icon: ArrowDownLeftIcon, actionId: "receive" },
  { label: "Add Cash", icon: PlusIcon, actionId: "add" },
  { label: "Withdraw", icon: BuildingLibraryIcon, actionId: "withdraw" },
];

export default function ActionGrid() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-3 min-w-max">
        {actions.map((action) => (
          <button 
            key={action.actionId}
            className="
              group flex items-center gap-2 px-5 py-3 
              bg-white dark:bg-slate-900 
              border border-slate-200 dark:border-slate-800 
              rounded-full shadow-sm 
              hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md 
              active:scale-95 transition-all duration-200
            "
          >
            <action.icon className="w-5 h-5 text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors" />
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}