import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
}

const StatsCard = ({
  icon: Icon,
  label,
  value,
  bgColor,
  iconColor,
}: StatsCardProps) => (
  <div className="group rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-300 hover:bg-surface-hover">
    <div className="flex items-center gap-5">
      <div
        className={cn(
          "rounded-xl p-4 transition-transform group-hover:scale-110",
          bgColor,
        )}
      >
        <Icon className={cn("size-7", iconColor)} />
      </div>
      <div>
        <p className="text-xs font-bold tracking-wider text-text-muted uppercase">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black text-text-primary">{value}</p>
      </div>
    </div>
  </div>
);

export default StatsCard;
