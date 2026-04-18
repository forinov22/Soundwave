import { MediaCard } from "@/shared/ui/MediaCard";

interface ArtistItemProps {
  name: string;
  image: string;
  onClick?: () => void;
}

export const ArtistItem = ({ name, image, onClick }: ArtistItemProps) => (
  <MediaCard
    image={image}
    title={name}
    subtitle="Исполнитель"
    imageShape="circle"
    imageZoomOnHover
    textAlign="center"
    onClick={onClick}
  />
);
