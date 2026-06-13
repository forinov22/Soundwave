import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Play,
  Heart,
  Clock,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackTable } from "@/shared/ui/TrackTable";
import { EntityHeader } from "@/shared/ui/EntityHeader";
import { formatDuration } from "@/shared/lib/formatDuration";
import { useDiscography } from "@/features/artist-public/lib/useDiscography";
import { useIntersection } from "@/features/artist-public/lib/useIntersection";
import { useLike } from "@/features/playlists/lib/useLike";
import { useLikeRelease } from "@/features/likes/lib/useLikeRelease";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import type { ReleaseDetails } from "@/shared/types/Release";
import type { DiscographyFilter } from "@/features/artist-public/types";

// ── Секция одного релиза ──────────────────────────────────────────────────────

const ReleaseSection = ({ release }: { release: ReleaseDetails }) => {
  const { playAlbum } = usePlayerPlayback();
  const { isLiked, toggleLike } = useLike();
  const { isReleaseLiked, toggleLikeRelease } = useLikeRelease();

  return (
    <div className="mb-12">
      <EntityHeader
        image={release.imageUrl ?? ""}
        type={release.type}
        title={release.title}
        meta={[
          release.releaseDate
            ? new Date(release.releaseDate).getFullYear().toString()
            : undefined,
          `${release.tracks.length} треков`,
        ]}
        preset="compact"
        imageHoverButton={
          <Button
            size="icon"
            onClick={() => playAlbum(release.tracks, 0)}
            className="size-12 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
          >
            <Play className="fill-current" />
          </Button>
        }
        actions={
          <ActionIcon
            icon={
              <Heart
                className={
                  isReleaseLiked(release.id)
                    ? "size-5 fill-emerald-500 text-emerald-500"
                    : "size-5"
                }
              />
            }
            variant="primary"
            withBackground
            label={isReleaseLiked(release.id) ? "Убрать из медиатеки" : "В медиатеку"}
            onClick={() => toggleLikeRelease(release.id)}
          />
        }
        className="mb-6"
      />

      <TrackTable
        data={release.tracks}
        getKey={(t) => t.id}
        onRowClick={(_, idx) => playAlbum(release.tracks, idx)}
        columns={[
          {
            key: "track",
            header: "Название",
            width: "1fr",
            render: (track) => (
              <div className="flex min-w-0 flex-col">
                <Typography variant="title" size="sm" truncate>
                  {track.title}
                </Typography>
                <Typography
                  variant="subtitle"
                  size="xs"
                  underlineOnHover
                  onClick={() => {}}
                >
                  {track.artistName}
                </Typography>
              </div>
            ),
          },
          {
            key: "like",
            width: "auto",
            align: "right",
            render: (track) => (
              <ActionIcon
                icon={
                  <Heart
                    className={
                      isLiked(track.id)
                        ? "size-4 fill-emerald-500 text-emerald-500"
                        : "size-4"
                    }
                  />
                }
                size="sm"
                label={isLiked(track.id) ? "Убрать из избранного" : "В избранное"}
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(track.id);
                }}
              />
            ),
          },
          {
            key: "duration",
            header: <Clock className="size-4" />,
            width: "auto",
            align: "right",
            render: (track) => (
              <Typography variant="subtitle" size="sm" className="font-mono">
                {formatDuration(track.durationSeconds)}
              </Typography>
            ),
          },
        ]}
      />
    </div>
  );
};

// ── Фильтры ───────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: DiscographyFilter }[] = [
  { label: "Все", value: null },
  { label: "Альбомы", value: "Album" },
  { label: "Синглы и EP", value: "Single" },
];

// ── Главный компонент ──────────────────────────────────────────────────────────

const ArtistDiscographyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistId = Number(id);

  const {
    releases,
    isLoading,
    filter,
    setFilter,
    sortField,
    setSortField,
    sortDir,
    toggleSortDir,
    loadMore,
    hasMore,
    totalCount,
  } = useDiscography(artistId);

  const { ref: sentinelRef, isIntersecting } = useIntersection({
    threshold: 0.1,
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, isLoading]);

  const activeFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Все";
  const sortLabel = sortField === "date" ? "По дате выхода" : "По имени релиза";

  return (
    <div className="mx-auto max-w-7xl">
      {/* Шапка с фильтрами */}
      <header className="sticky top-0 z-30 -mx-2 mb-8 flex flex-col justify-between gap-4 bg-[#121212]/95 px-2 py-4 backdrop-blur-md md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Link
            to={`/artist/${id}`}
            className="text-2xl font-black text-white hover:underline"
          >
            Дискография
          </Link>
          {totalCount > 0 && (
            <Typography
              variant="subtitle"
              size="sm"
              className="text-text-muted"
            >
              {totalCount} релизов
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 rounded-full border-none bg-zinc-800/80 px-4 text-white hover:bg-zinc-700"
              >
                {activeFilterLabel}{" "}
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 border-zinc-800 bg-zinc-900 text-white">
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.label}
                  onClick={() => setFilter(opt.value)}
                  className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 rounded-full border-none bg-zinc-800/80 px-4 text-white hover:bg-zinc-700"
              >
                {sortLabel}
                {sortDir === "asc" ? (
                  <ArrowUp className="size-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="size-4 text-emerald-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-white">
              <DropdownMenuItem
                onClick={() => setSortField("date")}
                className="cursor-pointer justify-between"
              >
                По дате выхода
                {sortField === "date" &&
                  (sortDir === "asc" ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  ))}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortField("name")}
                className="cursor-pointer justify-between"
              >
                По имени релиза
                {sortField === "name" &&
                  (sortDir === "asc" ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  ))}
              </DropdownMenuItem>
              <div className="my-1 h-px bg-zinc-800" />
              <DropdownMenuItem
                onClick={toggleSortDir}
                className="cursor-pointer text-xs font-bold text-emerald-500 uppercase"
              >
                Сменить направление
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Список релизов */}
      <div className="px-2">
        {isLoading && releases.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : releases.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <Typography variant="title" size="md">
              Релизов не найдено
            </Typography>
            <Typography variant="subtitle" size="sm">
              Попробуйте изменить фильтр
            </Typography>
          </div>
        ) : (
          <>
            {releases.map((release) => (
              <ReleaseSection key={release.id} release={release} />
            ))}

            <div ref={sentinelRef} className="h-4" />

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtistDiscographyPage;
