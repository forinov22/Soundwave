import { useEffect, useRef, useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";

interface TrackSearchInputProps {
  addedTrackIds: number[];
  onAdd: (trackId: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function TrackSearchInput({
  addedTrackIds,
  onAdd,
  isLoading = false,
  className,
}: Readonly<TrackSearchInputProps>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced поиск через API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        // GET /api/tracks/search?q=... — нужно добавить этот эндпоинт
        // (или переиспользовать trending с query-параметром)
        const res = await apiClient.get<Track[]>("/api/tracks/search", {
          params: { q: query.trim(), limit: 20 },
        });
        const filtered = res.data.filter((t) => !addedTrackIds.includes(t.id));
        setResults(filtered);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, addedTrackIds]);

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

  const handleAdd = (track: Track) => {
    onAdd(track.id);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        {isSearching || isLoading ? (
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
                        image={track.imageUrl}
                        title={track.title}
                        subtitle={track.artistName}
                        size="sm"
                      />
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
