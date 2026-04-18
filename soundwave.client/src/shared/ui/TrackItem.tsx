import { Play } from "lucide-react";
import { Typography } from "./Typography";

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
      className="group cursor-pointer rounded-xl border border-transparent bg-zinc-900/40 p-3 transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/60"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg shadow-lg">
        <img src={image} alt={name} className="h-full w-full object-cover" />
        {/* Кнопка Play при ховере */}
        <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="rounded-full bg-emerald-500 p-3 text-black shadow-xl">
            <Play className="size-5 fill-current" />
          </div>
        </div>
      </div>
      <Typography variant="title" truncate>
        {name}
      </Typography>
      <Typography variant="subtitle" underlineOnHover truncate>
        {artist}
      </Typography>
    </div>
  );
};

export default TrackItem;
