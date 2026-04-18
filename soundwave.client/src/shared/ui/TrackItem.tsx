import { Play } from "lucide-react";

import { MediaCard } from "@/shared/ui/MediaCard";

interface TrackItemProps {
  name: string;
  image: string;
  artist: string;
  onClick?: () => void;
}

const PlayButton = () => (
  <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-xl">
    <Play className="size-5 fill-current" />
  </div>
);

const TrackItem = ({ name, image, artist, onClick }: TrackItemProps) => (
  <MediaCard
    image={image}
    title={name}
    subtitle={artist}
    hoverButton={<PlayButton />}
    onClick={onClick}
  />
);

export default TrackItem;
