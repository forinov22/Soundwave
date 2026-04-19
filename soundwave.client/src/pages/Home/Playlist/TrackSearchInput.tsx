import { useEffect, useRef, useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { songsData, albumsData } from "@/assets/assets";

interface SearchTrack {
  id: number;
  name: string;
  image: string;
  duration: string;
  albumName?: string;
}

interface TrackSearchInputProps {
  // id треков уже добавленных в плейлист — чтобы не показывать их в результатах
  addedTrackIds: number[];
  onAdd: (track: SearchTrack) => void;
  className?: string;
}

// Симулируем поиск по хардкод данным
const searchTracks = (query: string): SearchTrack[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return songsData
    .filter((s) => s.name.toLowerCase().includes(q))
    .map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image,
      duration: s.duration,
      albumName: albumsData[s.id % albumsData.length]?.name,
    }));
};

export function TrackSearchInput({
  addedTrackIds,
  onAdd,
  className,
}: Readonly<TrackSearchInputProps>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTrack[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Симуляция дебаунс-поиска
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    const t = setTimeout(() => {
      const found = searchTracks(query).filter(
        (t) => !addedTrackIds.includes(t.id),
      );
      setResults(found);
      setIsOpen(true);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, addedTrackIds]);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdd = (track: SearchTrack) => {
    onAdd(track);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        {isLoading ? (
          <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-text-muted" />
        ) : (
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Найти треки для добавления..."
          className="border-white/10 bg-white/5 pl-9 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
        />
      </div>

      {/* Дропдаун с результатами */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-40 mt-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Typography variant="subtitle" size="sm">
                Ничего не найдено
              </Typography>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <TrackTable
                data={results}
                getKey={(t) => t.id}
                showIndex={false}
                showHeader={false}
                columns={[
                  {
                    key: "track",
                    width: "1fr",
                    render: (track) => (
                      <TrackRow
                        image={track.image}
                        title={track.name}
                        subtitle={track.albumName}
                        size="sm"
                      />
                    ),
                  },
                  {
                    key: "album",
                    width: "auto",
                    hideOnMobile: true,
                    render: (track) => (
                      <Typography
                        variant="subtitle"
                        size="sm"
                        truncate
                        className="max-w-32"
                      >
                        {track.albumName}
                      </Typography>
                    ),
                  },
                  {
                    key: "add",
                    width: "auto",
                    align: "right",
                    render: (track) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(track);
                        }}
                        className="flex size-7 items-center justify-center rounded-full text-icon transition-all hover:bg-icon-hover-bg hover:text-icon-hover active:scale-90"
                        aria-label="Добавить в плейлист"
                      >
                        <Plus className="size-4" />
                      </button>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
