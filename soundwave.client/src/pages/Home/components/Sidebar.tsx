import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Library,
  Plus,
  Search,
  ListFilter,
  Heart,
  Loader2,
  Music2,
  X,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TrackRow } from "@/shared/ui/TrackRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlaylists } from "@/features/playlists/lib/usePlaylists";
import { useLikes } from "@/features/likes/lib/useLikes";
import { cn } from "@/lib/utils";

type LibraryFilter = "Все" | "Плейлисты" | "Исполнители" | "Альбомы";
type SortOption = "Недавно добавленные" | "По алфавиту" | "По автору";

const FILTERS: LibraryFilter[] = ["Все", "Плейлисты", "Исполнители", "Альбомы"];

const Sidebar = ({
  isCollapsed,
  toggleCollapse,
}: {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("Все");
  const [sortOption, setSortOption] = useState<SortOption>(
    "Недавно добавленные",
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    playlists,
    isLoading: playlistsLoading,
    createPlaylist,
    isCreating,
  } = usePlaylists();
  const {
    likedReleases,
    followedArtists,
    isLoading: likesLoading,
  } = useLikes();

  const isLoading = playlistsLoading || likesLoading;

  const handleCreatePlaylist = async () => {
    const created = await createPlaylist();
    if (created) navigate(`/playlist/${created.id}`);
  };

  const q = searchQuery.toLowerCase();

  const filteredPlaylists = useMemo(() => {
    let items = [...playlists];
    if (q) items = items.filter((p) => p.title.toLowerCase().includes(q));
    if (sortOption === "По алфавиту")
      items.sort((a, b) => a.title.localeCompare(b.title));
    return items;
  }, [playlists, q, sortOption]);

  const filteredArtists = useMemo(() => {
    let items = [...followedArtists];
    if (q) items = items.filter((a) => a.name.toLowerCase().includes(q));
    if (sortOption === "По алфавиту" || sortOption === "По автору")
      items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }, [followedArtists, q, sortOption]);

  const filteredReleases = useMemo(() => {
    let items = [...likedReleases];
    if (q)
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.artistName?.toLowerCase().includes(q),
      );
    if (sortOption === "По алфавиту")
      items.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === "По автору")
      items.sort((a, b) =>
        (a.artistName ?? "").localeCompare(b.artistName ?? ""),
      );
    return items;
  }, [likedReleases, q, sortOption]);

  const showPlaylists = activeFilter === "Все" || activeFilter === "Плейлисты";
  const showArtists = activeFilter === "Все" || activeFilter === "Исполнители";
  const showReleases = activeFilter === "Все" || activeFilter === "Альбомы";

  return (
    <div
      className={`flex h-full flex-col gap-2 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-85"
      } hidden lg:flex`}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md">
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 text-zinc-400">
          <button
            onClick={toggleCollapse}
            className="group flex items-center gap-3 px-2 transition-colors hover:text-white"
          >
            <Library className="size-6 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="font-bold">Моя медиатека</span>}
          </button>
          {!isCollapsed && activeFilter === "Плейлисты" && (
            <button
              onClick={handleCreatePlaylist}
              disabled={isCreating}
              className="hover:text-white disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Фильтры */}
            <div className="mb-3 flex flex-wrap gap-2 px-4">
              {FILTERS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={cn(
                    "rounded-full px-2 py-1.5 text-xs font-medium transition-colors",
                    activeFilter === tag
                      ? "bg-white text-black"
                      : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Поиск + сортировка */}
            <div className="mb-2 flex flex-col gap-2 px-4">
              <div className="flex items-center justify-between text-zinc-400">
                <button
                  onClick={() => {
                    setSearchOpen((v) => !v);
                    if (searchOpen) setSearchQuery("");
                  }}
                  className="hover:text-white"
                  aria-label="Поиск"
                >
                  <Search className="size-4" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-xs outline-none hover:text-white">
                    {sortOption} <ListFilter className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
                    <DropdownMenuLabel className="text-[10px] text-zinc-500 uppercase">
                      Сортировка
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    {(
                      [
                        "Недавно добавленные",
                        "По алфавиту",
                        "По автору",
                      ] as SortOption[]
                    ).map((opt) => (
                      <DropdownMenuItem
                        key={opt}
                        onClick={() => setSortOption(opt)}
                        className={cn(sortOption === opt && "text-white")}
                      >
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {searchOpen && (
                <div className="relative">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Найти в медиатеке..."
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}

            {/* Плейлисты */}
            {showPlaylists &&
              filteredPlaylists.map((playlist) => (
                <TrackRow
                  key={`pl-${playlist.id}`}
                  image={
                    playlist.isLikedSongs ? (
                      <div className="flex size-full items-center justify-center rounded bg-gradient-to-br from-indigo-700 to-emerald-400">
                        <Heart className="size-5 fill-white text-white" />
                      </div>
                    ) : playlist.imageUrl ? (
                      playlist.imageUrl
                    ) : (
                      <div className="flex size-full items-center justify-center rounded bg-zinc-700">
                        <span className="text-xs text-zinc-400">♪</span>
                      </div>
                    )
                  }
                  title={isCollapsed ? "" : playlist.title}
                  subtitle={
                    isCollapsed
                      ? undefined
                      : `Плейлист · ${playlist.trackCount} треков`
                  }
                  size="md"
                  highlightOnHover
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                />
              ))}

            {/* Артисты (подписки) */}
            {showArtists && (
              <>
                {filteredArtists.length === 0 &&
                  !isLoading &&
                  activeFilter === "Исполнители" && (
                    <p className="px-2 py-4 text-center text-xs text-zinc-500">
                      Подпишитесь на артистов — они появятся здесь
                    </p>
                  )}
                {filteredArtists.map((artist) => (
                  <TrackRow
                    key={`ar-${artist.id}`}
                    image={
                      artist.avatarUrl ?? (
                        <div className="flex size-full items-center justify-center rounded-full bg-zinc-700">
                          <Music2 className="size-4 text-zinc-400" />
                        </div>
                      )
                    }
                    imageShape="circle"
                    title={isCollapsed ? "" : artist.name}
                    subtitle={isCollapsed ? undefined : "Артист"}
                    size="md"
                    highlightOnHover
                    onClick={() => navigate(`/artist/${artist.id}`)}
                  />
                ))}
              </>
            )}

            {/* Альбомы (лайкнутые) */}
            {showReleases && (
              <>
                {filteredReleases.length === 0 &&
                  !isLoading &&
                  activeFilter === "Альбомы" && (
                    <p className="px-2 py-4 text-center text-xs text-zinc-500">
                      Лайкайте альбомы — они появятся здесь
                    </p>
                  )}
                {filteredReleases.map((release) => (
                  <TrackRow
                    key={`re-${release.id}`}
                    image={
                      release.imageUrl ?? (
                        <div className="flex size-full items-center justify-center rounded bg-zinc-700">
                          <Music2 className="size-4 text-zinc-400" />
                        </div>
                      )
                    }
                    title={isCollapsed ? "" : release.title}
                    subtitle={
                      isCollapsed
                        ? undefined
                        : `${release.type} · ${release.artistName}`
                    }
                    size="md"
                    highlightOnHover
                    onClick={() => navigate(`/album/${release.id}`)}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
