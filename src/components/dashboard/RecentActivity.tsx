import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const transactions = [
  { id: 1, name: "Emeka O.", type: "Received", amount: "+$50.00", date: "Today, 9:41 AM", avatar: "E" },
  { id: 2, name: "Netflix", type: "Subscription", amount: "-$15.99", date: "Yesterday", avatar: "N" },
  { id: 3, name: "Chioma A.", type: "Sent", amount: "-$120.00", date: "Oct 24", avatar: "C" },
];

export default function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
        <button className="text-sm text-purple-600 font-medium">See all</button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{tx.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900">{tx.name}</p>
                <p className="text-xs text-slate-500">{tx.type} • {tx.date}</p>
              </div>
            </div>
            <span className={`font-bold ${tx.amount.startsWith("+") ? "text-green-600" : "text-slate-900"}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
