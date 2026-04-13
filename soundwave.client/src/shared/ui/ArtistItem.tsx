interface ArtistItemProps {
  name: string;
  image: string;
}

export const ArtistItem = ({ name, image }: ArtistItemProps) => {
  return (
    <div className="group p-4 rounded-xl hover:bg-zinc-800/40 transition-all text-center cursor-pointer">
      <div className="relative aspect-square mb-4 mx-auto overflow-hidden rounded-full shadow-2xl w-4/5">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="font-bold text-zinc-100 truncate">{name}</h3>
      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tighter">
        Исполнитель
      </p>
    </div>
  );
};
