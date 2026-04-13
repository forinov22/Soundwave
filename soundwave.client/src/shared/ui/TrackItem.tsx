import { Play } from "lucide-react";

interface TrackItemProps {
  name: string;
  image: string;
  artist: string;
  onClick?: () => void;
}

const TrackItem = ({ name, image, artist, onClick }: TrackItemProps) => {
  return (
    <div
      onClick={onClick}
      className="group p-3 rounded-xl bg-zinc-900/40 border border-transparent hover:border-zinc-700/50 hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg shadow-lg">
        <img src={image} alt={name} className="object-cover w-full h-full" />
        {/* Кнопка Play при ховере */}
        <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-emerald-500 p-3 rounded-full shadow-xl text-black">
            <Play className="fill-current size-5" />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-zinc-100 truncate">{name}</h3>
      <p className="text-sm text-zinc-400 truncate">{artist}</p>
    </div>
  );
};

export default TrackItem;
