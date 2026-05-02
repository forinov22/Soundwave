import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Clock, GripVertical, X } from "lucide-react";

import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { useArtist } from "@/features/artist/lib/useArtist";
import { formatDuration } from "@/shared/lib/formatDuration";
import { cn } from "@/lib/utils";
import type { Track } from "@/shared/types/Track";

interface ReleaseTracksListProps {
  releaseId: number;
  tracks: Track[];
  editable: boolean;
}

const ReleaseTracksList = ({
  releaseId,
  tracks,
  editable,
}: ReleaseTracksListProps) => {
  const {
    reorderTracks,
    removeTrackFromRelease,
    isReorderingTracks,
    isRemovingTrackFromRelease,
  } = useArtist();

  const [localOrder, setLocalOrder] = useState<Track[]>(tracks);

  useEffect(() => {
    setLocalOrder(tracks);
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline-strong py-10 text-center">
        <Typography variant="title" size="sm" className="mb-1 font-semibold">
          Треков пока нет
        </Typography>
        <Typography variant="subtitle" size="xs">
          {editable
            ? "Нажмите «Добавить треки», чтобы выбрать из плейграунда"
            : "Этот релиз пока без треков"}
        </Typography>
      </div>
    );
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const next = [...localOrder];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setLocalOrder(next);

    try {
      await reorderTracks(
        releaseId,
        next.map((t) => t.id),
      );
    } catch {
      setLocalOrder(tracks);
    }
  };

  if (!editable) {
    return (
      <ul className="space-y-0.5">
        {localOrder.map((track, idx) => (
          <li
            key={track.id}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-track-row-hover"
          >
            <span className="w-6 text-center text-xs text-text-muted">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <TrackRow
                image={track.imageUrl}
                title={track.title}
                subtitle={track.artistName}
                size="sm"
              />
            </div>
            <Typography
              variant="subtitle"
              size="sm"
              className="flex items-center gap-1.5 font-mono text-text-muted"
            >
              <Clock className="size-3" />
              {formatDuration(track.durationSeconds)}
            </Typography>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`release-${releaseId}-tracks`}>
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn("space-y-0.5", isReorderingTracks && "opacity-80")}
          >
            {localOrder.map((track, idx) => (
              <Draggable
                key={track.id}
                draggableId={`track-${track.id}`}
                index={idx}
              >
                {(prov, snap) => (
                  <li
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg p-2 transition-colors",
                      snap.isDragging
                        ? "bg-graphite-card-hover shadow-xl"
                        : "hover:bg-track-row-hover",
                    )}
                  >
                    <span
                      {...prov.dragHandleProps}
                      className="cursor-grab text-text-muted transition-colors hover:text-text-secondary active:cursor-grabbing"
                      aria-label="Перетащить"
                    >
                      <GripVertical className="size-4" />
                    </span>

                    <span className="w-5 text-center text-xs text-text-muted transition-colors group-hover:text-text-secondary">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <TrackRow
                        image={track.imageUrl}
                        title={track.title}
                        subtitle={track.artistName}
                        size="sm"
                      />
                    </div>

                    <Typography
                      variant="subtitle"
                      size="sm"
                      className="hidden items-center gap-1.5 font-mono text-text-muted md:flex"
                    >
                      <Clock className="size-3" />
                      {formatDuration(track.durationSeconds)}
                    </Typography>

                    <button
                      onClick={() =>
                        removeTrackFromRelease(releaseId, track.id)
                      }
                      disabled={isRemovingTrackFromRelease}
                      className="flex size-7 items-center justify-center rounded-full text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 active:scale-90 disabled:opacity-40"
                      aria-label="Убрать из релиза"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ReleaseTracksList;
