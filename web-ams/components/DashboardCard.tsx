interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  color?: "primary" | "green" | "red" | "amber" | "slate";
}

export default function DashboardCard({
  title,
  value,
  icon,
  color = "primary",
}: DashboardCardProps) {
  const colors: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600 border-primary-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const c = colors[color] || colors.primary;

  return (
    <div className="card border-2 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg border ${c}`}>
          <span className="text-2xl flex items-center justify-center">{icon}</span>
        </div>
      </div>
    </div>
  );
}

