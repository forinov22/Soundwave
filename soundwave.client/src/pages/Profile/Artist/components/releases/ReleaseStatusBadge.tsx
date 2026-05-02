import { FileEdit, CheckCircle2, Archive } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReleaseStatus } from "@/shared/types/Release";

interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
  className?: string;
}

const config: Record<
  ReleaseStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  Draft: {
    label: "Черновик",
    icon: FileEdit,
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  Published: {
    label: "Опубликовано",
    icon: CheckCircle2,
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  Archived: {
    label: "В архиве",
    icon: Archive,
    color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  },
};

const ReleaseStatusBadge = ({ status, className }: ReleaseStatusBadgeProps) => {
  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-medium",
        cfg.color,
        className,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
};

export default ReleaseStatusBadge;
