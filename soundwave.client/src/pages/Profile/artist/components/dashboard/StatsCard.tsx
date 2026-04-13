import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    icon: React.ElementType,
    label: string;
    value: string;
    bgColor: string;
    iconColor: string;
}

const StatsCard = ({ icon: Icon, label, value, bgColor, iconColor }: StatsCardProps) => {
  return (
    <Card className="bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 transition-all duration-300 rounded-2xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className={cn('p-4 rounded-xl transition-transform group-hover:scale-110', bgColor)}>
            <Icon className={cn('size-7', iconColor)} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black text-white mt-1">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard