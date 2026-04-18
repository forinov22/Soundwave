import { Typography } from "./Typography";

interface AlbumItemProps {
  name: string;
  image: string;
  description: string;
  onClick: () => void;
}

const AlbumItem = ({ name, image, description, onClick }: AlbumItemProps) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-transparent bg-zinc-900/40 p-3 transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/60"
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-lg shadow-lg">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <Typography variant="title" underlineOnHover truncate>
        {name}
      </Typography>
      <Typography variant="caption" clamp={2} truncate className="mt-1">
        {description}
      </Typography>
    </div>
  );
};

export default AlbumItem;
