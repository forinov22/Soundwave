import { Disc3, Music2, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReleaseType } from "@/shared/types/Release";

interface ReleaseTypeBadgeProps {
  type: ReleaseType;
  className?: string;
}

// Маленький бейдж типа релиза — Single / EP / Album.
// Используется на карточке релиза и в шапке редактора.
const config: Record<
  ReleaseType,
  { label: string; icon: React.ElementType; color: string }
> = {
  Single: {
    label: "Сингл",
    icon: Music2,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  EP: {
    label: "EP",
    icon: Layers,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  Album: {
    label: "Альбом",
    icon: Disc3,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
};

const ReleaseTypeBadge = ({ type, className }: ReleaseTypeBadgeProps) => {
  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-bold tracking-wider uppercase",
        cfg.color,
        className,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
};

export default ReleaseTypeBadge;
