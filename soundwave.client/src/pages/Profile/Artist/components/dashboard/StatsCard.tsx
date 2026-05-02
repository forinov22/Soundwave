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
  <div
    className={cn(
      "group rounded-2xl border border-hairline bg-graphite-card p-5",
      "transition-colors duration-200 hover:bg-graphite-card-hover",
    )}
  >
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          "transition-transform group-hover:scale-105",
          bgColor,
        )}
      >
        <Icon className={cn("size-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default StatsCard;
