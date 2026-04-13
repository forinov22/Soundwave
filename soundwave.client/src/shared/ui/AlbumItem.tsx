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
      className="group p-3 rounded-xl bg-zinc-900/40 border border-transparent hover:border-zinc-700/50 hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-square mb-3 overflow-hidden rounded-lg shadow-lg">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <h3 className="font-bold text-zinc-100 truncate">{name}</h3>
      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{description}</p>
    </div>
  );
};

export default AlbumItem;
