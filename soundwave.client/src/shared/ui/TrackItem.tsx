import { Play, Pause } from "lucide-react";

import { MediaCard } from "@/shared/ui/MediaCard";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";

interface TrackItemProps {
  trackId?: number;
  name: string;
  image: string;
  artist: string;
  onClick?: () => void;
}

const TrackItem = ({ trackId, name, image, artist, onClick }: TrackItemProps) => {
  const { currentTrack, isPlaying } = usePlayerPlayback();
  const isActive = trackId !== undefined && currentTrack?.id === trackId && isPlaying;

  const HoverButton = (
    <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-xl">
      {isActive ? (
        <Pause className="size-5 fill-current" />
      ) : (
        <Play className="size-5 fill-current" />
      )}
    </div>
  );

  return (
    <MediaCard
      image={image}
      title={name}
      subtitle={artist}
      hoverButton={HoverButton}
      onClick={onClick}
    />
  );
};

export default TrackItem;
