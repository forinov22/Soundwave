import { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
import { 
  Play, 
  Shuffle, 
  Heart, 
  MoreHorizontal, 
  Users, 
  Clock, 
  Check, 
  Plus,
  Pause
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { assets, songsData, albumsData } from "@/assets/assets"; // Предположим, путь такой
import { cn } from "@/lib/utils";

import type { LayoutOutletContext } from "../../MainLayout";

const ArtistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();
  
  const [activeFilter, setActiveFilter] = useState("Популярные релизы");
  const [isFollowing, setIsFollowing] = useState(false);

  // Хардкод данных для верстки (потом заменим на fetch)
  const artist = {
    name: "Imagine Dragons",
    monthlyListeners: 102456789,
    imageUrl: songsData[0].image,
    headerImageUrl: songsData[1].image, // Баннер
  };

  useEffect(() => {
    // Устанавливаем градиент на основе "бренд-цвета" артиста
    setGradientBgColor("#424242"); 
    return () => setGradientBgColor();
  }, [setGradientBgColor]);

  return (
    <div className="relative pb-10">
      {/* 1. Секция Баннера (Artist Card Style) */}
      <div className="relative h-[30vh] md:h-[40vh] -mx-6 -mt-6 overflow-hidden flex items-end p-8">
        <img 
          src={artist.headerImageUrl} 
          className="absolute inset-0 w-full h-full object-cover brightness-75"
          alt="" 
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 rounded-full p-1">
              <Check className="size-3 text-white fill-current" />
            </div>
            <span className="text-sm font-medium text-white shadow-sm">Подтвержденный исполнитель</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white drop-shadow-lg mb-6">
            {artist.name}
          </h1>
          <div className="flex items-center gap-2 text-white font-medium">
            <Users className="size-5" />
            <span>{artist.monthlyListeners.toLocaleString()} слушателей в месяц</span>
          </div>
        </div>
      </div>

      {/* 2. Блок управления */}
      <div className="flex items-center gap-6 my-8">
        <Button size="icon" className="size-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg hover:scale-105 transition-transform">
          <Play className="fill-current size-6" />
        </Button>
        <Button variant="outline" size="icon" className="size-10 rounded-full border-zinc-600 text-zinc-400 hover:text-white hover:border-white">
          <Shuffle className="size-5" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "rounded-full border-zinc-600 px-6 font-bold uppercase text-xs tracking-widest transition-all",
            isFollowing ? "border-emerald-500 text-emerald-500" : "text-white hover:border-white"
          )}
        >
          {isFollowing ? "Вы подписаны" : "Подписаться"}
        </Button>
        <MoreHorizontal className="size-8 text-zinc-400 hover:text-white cursor-pointer" />
      </div>

      {/* 3. Популярные треки */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Популярные треки</h2>
        <div className="w-full">
          {songsData.slice(0, 5).map((track, idx) => (
            <div 
              key={track.id} 
              className="grid grid-cols-[16px_auto_1fr_auto_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/10 group items-center cursor-pointer transition-colors text-zinc-400"
            >
              <span className="text-sm w-4 flex justify-center">
                <span className="group-hover:hidden">{idx + 1}</span>
                <Play className="size-3 hidden group-hover:block fill-current text-white" />
              </span>
              <img src={track.image} className="size-10 rounded shadow-md" alt="" />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-medium truncate">{track.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <span className="text-[10px] px-1 bg-zinc-700 text-zinc-300 rounded-sm">E</span>
                   <span className="text-xs truncate">Night Visions</span>
                </div>
              </div>
              <span className="text-sm hidden md:block">854,234,102</span>
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  <Plus className="size-4 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" />
                </div>
                <span className="text-sm w-10 text-right">{track.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Секция Музыка с фильтрами */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Музыка</h2>
          <button 
            onClick={() => navigate(`/artist/${id}/discography`)}
            className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Показать все
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["Популярные релизы", "Альбомы", "Синглы", "EP"].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeFilter === tag 
                  ? "bg-white text-black" 
                  : "bg-zinc-800/50 text-white hover:bg-zinc-800"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {albumsData.slice(0, 5).map((album) => (
            <div 
              key={album.id}
              className="p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 transition-all group cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="relative aspect-square mb-4 shadow-2xl">
                <img src={album.image} className="w-full h-full object-cover rounded-lg" alt="" />
                <Button 
                  size="icon" 
                  className="absolute bottom-2 right-2 size-12 rounded-full bg-emerald-500 text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl shadow-black/50"
                >
                  <Play className="fill-current" />
                </Button>
              </div>
              <h3 className="font-bold text-white truncate mb-1">{album.name}</h3>
              <p className="text-sm text-zinc-400">
                {album.id % 2 === 0 ? "Альбом" : "Сингл"} • 2023
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArtistDetailsPage;