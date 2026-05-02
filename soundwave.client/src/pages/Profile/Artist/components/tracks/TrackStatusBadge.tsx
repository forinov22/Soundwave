import { CheckCircle2, FileEdit, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getDraftReleases,
  getPublishedReleases,
  isFreeTrack,
  type ArtistTrack,
} from "@/features/artist/types/ArtistTrack";

interface TrackStatusBadgeProps {
  track: ArtistTrack;
  className?: string;
}

// Показывает, в каком состоянии трек в плейграунде:
//  - свободен (нет релизов)
//  - в черновиках (один или несколько)
//  - опубликован (приоритет, если есть в обоих)
//
// Текст компактный — в таблице мало места. Если черновиков несколько,
// показываем первое название и счётчик "+N".
const TrackStatusBadge = ({ track, className }: TrackStatusBadgeProps) => {
  if (isFreeTrack(track)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
          "text-xs font-medium",
          "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
          className,
        )}
      >
        <Sparkles className="size-3" />
        Свободен
      </span>
    );
  }

  const published = getPublishedReleases(track);
  if (published.length > 0) {
    // Опубликован — приоритет. Если в нескольких опубликованных
    // (формально невозможно по нашим инвариантам, но защищаемся),
    // показываем первый.
    const first = published[0];
    const extra = published.length - 1;

    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5",
          "text-xs font-medium",
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
          className,
        )}
        title={published.map((r) => r.title).join(", ")}
      >
        <CheckCircle2 className="size-3 shrink-0" />
        <span className="truncate">{first.title}</span>
        {extra > 0 && <span className="opacity-70">+{extra}</span>}
      </span>
    );
  }

  // Только черновики
  const drafts = getDraftReleases(track);
  const first = drafts[0];
  const extra = drafts.length - 1;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-xs font-medium",
        "border-amber-500/20 bg-amber-500/10 text-amber-300",
        className,
      )}
      title={drafts.map((r) => r.title).join(", ")}
    >
      <FileEdit className="size-3 shrink-0" />
      <span className="truncate">{first.title}</span>
      {extra > 0 && <span className="opacity-70">+{extra}</span>}
    </span>
  );
};

export default TrackStatusBadge;
