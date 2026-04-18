import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Play,
  Heart,
  Plus,
  Clock,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assets, songsData, albumsData } from "@/assets/assets";
import { formatDuration } from "@/shared/lib/formatDuration";
import { cn } from "@/lib/utils";
import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackRow } from "@/shared/ui/TrackRow";
import { TrackTable } from "@/shared/ui/TrackTable";

// Суб-компонент для одного релиза в списке
const ReleaseSection = ({ album, tracks }: { album: any; tracks: any[] }) => {
  return (
    <div className="group/release mb-12">
      {/* Шапка релиза */}
      <div className="mb-6 flex gap-6">
        <div className="relative size-36 flex-shrink-0 shadow-2xl md:size-44">
          <img
            src={album.image}
            alt={album.name}
            className="h-full w-full rounded-md object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/release:opacity-100">
            <Button
              size="icon"
              className="size-12 rounded-full bg-emerald-500 text-black transition-transform hover:scale-105"
            >
              <Play className="fill-current" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-end py-2">
          <h2 className="mb-2 cursor-pointer text-2xl font-bold text-white hover:underline md:text-3xl">
            {album.name}
          </h2>
          <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
            <span className="capitalize">
              {album.id % 2 === 0 ? "Альбом" : "Сингл"}
            </span>
            <span>•</span>
            <span>2024</span>
            <span>•</span>
            <span>{tracks.length} треков</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <Heart className="size-5" />
            </Button>
            <MoreHorizontal className="cursor-pointer text-zinc-400 hover:text-white" />
          </div>
        </div>
      </div>

      {/* Таблица треков этого релиза */}
      <TrackTable
        data={tracks}
        getKey={(t) => t.id}
        onRowClick={() => {}}
        columns={[
          {
            key: "track",
            header: "Название",
            width: "1fr",
            render: (track) => (
              <div className="flex min-w-0 flex-col">
                <Typography variant="title" size="sm" truncate>
                  {track.name}
                </Typography>
                <Typography
                  variant="subtitle"
                  size="xs"
                  underlineOnHover
                  onClick={() => {}}
                >
                  Исполнитель
                </Typography>
              </div>
            ),
          },
          {
            key: "add",
            width: "auto",
            align: "right",
            render: () => (
              <ActionIcon
                icon={<Plus className="size-4" />}
                size="sm"
                label="Добавить"
                className="opacity-0 group-hover:opacity-100"
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
                {track.duration}
              </Typography>
            ),
          },
        ]}
      />
    </div>
  );
};

const ArtistDiscographyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Состояния для фильтрации и сортировки
  const [filter, setFilter] = useState("Все");
  const [sortBy, setSortBy] = useState("По дате выхода");
  const [isAsc, setIsAsc] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      {/* 1. Навигация и фильтры */}
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
            Imagine Dragons
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown Фильтр */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 rounded-full border-none bg-zinc-800/80 px-4 text-white hover:bg-zinc-700"
              >
                {filter} <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 border-zinc-800 bg-zinc-900 text-white">
              {["Все", "Альбомы", "Синглы и EP"].map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown Сортировка */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 rounded-full border-none bg-zinc-800/80 px-4 text-white hover:bg-zinc-700"
              >
                {sortBy}
                {isAsc ? (
                  <ArrowUp className="size-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="size-4 text-emerald-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-white">
              <DropdownMenuItem
                onClick={() => setSortBy("По дате выхода")}
                className="cursor-pointer justify-between"
              >
                По дате выхода{" "}
                {sortBy === "По дате выхода" &&
                  (isAsc ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  ))}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("По имени релиза")}
                className="cursor-pointer justify-between"
              >
                По имени релиза{" "}
                {sortBy === "По имени релиза" &&
                  (isAsc ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  ))}
              </DropdownMenuItem>
              <div className="my-1 h-px bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => setIsAsc(!isAsc)}
                className="cursor-pointer text-xs font-bold text-emerald-500 uppercase"
              >
                Сменить направление
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 2. Список релизов */}
      <div className="px-2">
        {albumsData.slice(0, 3).map((album) => (
          <ReleaseSection
            key={album.id}
            album={album}
            tracks={songsData.slice(0, 4)} // Заглушка: берем первые 4 трека для каждого альбома
          />
        ))}
      </div>
    </div>
  );
};

export default ArtistDiscographyPage;
