import { AlertCircle, XCircle } from "lucide-react";

import { Typography } from "@/shared/ui/Typography";
import type { PublishConflictItem } from "@/features/artist/types/Payloads";

interface PublishErrorBannerProps {
  validationMessage?: string | null;
  conflicts?: PublishConflictItem[] | null;
  onDismiss: () => void;
}

const PublishErrorBanner = ({
  validationMessage,
  conflicts,
  onDismiss,
}: PublishErrorBannerProps) => {
  if (!validationMessage && !conflicts?.length) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-400" />

      <div className="flex-1">
        <Typography variant="title" size="sm" className="text-red-300">
          Не удалось опубликовать
        </Typography>

        {validationMessage && (
          <Typography variant="subtitle" size="sm" className="mt-1">
            {validationMessage}
          </Typography>
        )}

        {conflicts && conflicts.length > 0 && (
          <div className="mt-2 space-y-2">
            <Typography variant="subtitle" size="sm">
              Некоторые треки уже опубликованы в других релизах. Удалите их из
              этого релиза или из тех, чтобы избежать дублирования:
            </Typography>
            <ul className="space-y-1">
              {conflicts.map((c) => (
                <li
                  key={`${c.releaseId}-${c.trackId}`}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <span className="size-1.5 rounded-full bg-red-400" />
                  Трек #{c.trackId} → опубликован в{" "}
                  <span className="font-semibold text-text-primary">
                    «{c.releaseTitle}»
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text-primary"
        aria-label="Закрыть"
      >
        <XCircle className="size-4" />
      </button>
    </div>
  );
};

export default PublishErrorBanner;
