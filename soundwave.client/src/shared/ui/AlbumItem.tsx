import { MediaCard } from "@/shared/ui/MediaCard";

interface AlbumItemProps {
  name: string;
  image: string;
  description: string;
  onClick: () => void;
}

const AlbumItem = ({ name, image, description, onClick }: AlbumItemProps) => (
  <MediaCard
    image={image}
    title={name}
    subtitle={description}
    subtitleClamp={2}
    imageZoomOnHover
    titleUnderlineOnHover
    onClick={onClick}
  />
);

export default AlbumItem;
