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
  MoreHorizontal
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

// Суб-компонент для одного релиза в списке
const ReleaseSection = ({ album, tracks }: { album: any, tracks: any[] }) => {
  return (
    <div className="mb-12 group/release">
      {/* Шапка релиза */}
      <div className="flex gap-6 mb-6">
        <div className="relative size-36 md:size-44 flex-shrink-0 shadow-2xl">
          <img src={album.image} alt={album.name} className="w-full h-full object-cover rounded-md" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/release:opacity-100 transition-opacity flex items-center justify-center">
             <Button size="icon" className="size-12 rounded-full bg-emerald-500 text-black hover:scale-105 transition-transform">
                <Play className="fill-current" />
             </Button>
          </div>
        </div>
        
        <div className="flex flex-col justify-end py-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 hover:underline cursor-pointer">
            {album.name}
          </h2>
          <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
            <span className="capitalize">{album.id % 2 === 0 ? "Альбом" : "Сингл"}</span>
            <span>•</span>
            <span>2024</span>
            <span>•</span>
            <span>{tracks.length} треков</span>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
             <Button size="icon" variant="ghost" className="rounded-full text-zinc-400 hover:text-white border border-zinc-800">
               <Heart className="size-5" />
             </Button>
             <MoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Таблица треков этого релиза */}
      <div className="w-full">
        <div className="grid grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <span>#</span>
          <span>Название</span>
          <div className=""></div>
          <div className="flex justify-center"><Clock className="size-4" /></div>
        </div>

        <div className="mt-2">
          {tracks.map((track, idx) => (
            <div 
              key={track.id}
              className="grid grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-3 rounded-md hover:bg-white/5 group items-center transition-colors"
            >
              <div className="text-zinc-500 text-sm flex justify-center">
                <span className="group-hover:hidden">{idx + 1}</span>
                <Play className="size-3 hidden group-hover:block fill-current text-white" />
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-white font-medium truncate">{track.name}</span>
                <Link 
                  to={`/artist/1`} 
                  className="text-xs text-zinc-400 hover:underline hover:text-white transition-colors w-fit"
                >
                  Исполнитель
                </Link>
              </div>

              <div className="flex justify-end px-4">
                <Plus className="size-4 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer" />
              </div>

              <div className="text-zinc-400 text-sm font-mono">
                {track.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
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
    <div className="max-w-7xl mx-auto">
      {/* 1. Навигация и фильтры */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 bg-[#121212]/95 backdrop-blur-md z-30 py-4 -mx-2 px-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/40 hover:bg-black/60 text-white"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Link to={`/artist/${id}`} className="text-2xl font-black text-white hover:underline">
            Imagine Dragons
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown Фильтр */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 gap-2 border-none">
                {filter} <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white w-48">
              {["Все", "Альбомы", "Синглы и EP"].map((opt) => (
                <DropdownMenuItem key={opt} onClick={() => setFilter(opt)} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown Сортировка */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 gap-2 border-none">
                {sortBy} 
                {isAsc ? <ArrowUp className="size-4 text-emerald-500" /> : <ArrowDown className="size-4 text-emerald-500" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white w-56">
              <DropdownMenuItem onClick={() => setSortBy("По дате выхода")} className="justify-between cursor-pointer">
                По дате выхода {sortBy === "По дате выхода" && (isAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("По имени релиза")} className="justify-between cursor-pointer">
                По имени релиза {sortBy === "По имени релиза" && (isAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
              </DropdownMenuItem>
              <div className="h-px bg-zinc-800 my-1" />
              <DropdownMenuItem onClick={() => setIsAsc(!isAsc)} className="text-xs text-emerald-500 font-bold uppercase cursor-pointer">
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