import {
  DragDropContext,
  Droppable,
  Draggable,
 } from "@hello-pangea/dnd";
 import { GripVertical, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { usePlayerPlayback } from "../lib/usePlayerPlayback";

export function QueueList() {
  const {
    trackList,
    currentTrackIndex,
    moveTrack,
    removeFromQueue,
    playFromQueue,
  } = usePlayerPlayback();

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    moveTrack(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="queue-list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
            {trackList.map((track, index) => (
              <Draggable key={`${track.id}-${index}`} draggableId={`${track.id}-${index}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-all group",
                      index === currentTrackIndex ? "bg-spotify-green/10" : "hover:bg-white/5",
                      snapshot.isDragging && "bg-zinc-800 shadow-xl"
                    )}
                  >
                    {/* Хэндл перетаскивания */}
                    <div {...provided.dragHandleProps} className="text-zinc-600 hover:text-zinc-400">
                      <GripVertical className="size-4" />
                    </div>

                    {/* Инфо о треке (клик включает его) */}
                    <div 
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => playFromQueue(index)}
                    >
                      <img src={track.imageUrl} className="size-10 rounded shadow-lg" alt="" />
                      <div className="truncate">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          index === currentTrackIndex ? "text-spotify-green" : "text-white"
                        )}>
                          {track.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{track.artistName}</p>
                      </div>
                    </div>

                    {/* Удаление */}
                    <button 
                      onClick={() => removeFromQueue(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}