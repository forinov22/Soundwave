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
  // Явные светлые значения — не через --surface токен, чтобы не зависеть от темы
  <div className="group overflow-hidden rounded-2xl border border-white/5 bg-[oklch(0.22_0_0)] p-6 transition-all duration-300 hover:bg-[oklch(0.26_0_0)]">
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
