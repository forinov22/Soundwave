interface SongItemProps {
    // id: number;
    name: string;
    image: string;
    description: string;
}

const SongItem = ({
    // id,
    name,
    image,
    description,
}: SongItemProps) => {
  return (
    <div className="min-w-45 p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
        <img src={image} alt={name} className="rounded" />
        <p className="mt-2 mb-1 font-bold">{name}</p>
        <p className="text-sm text-slate-200">{description}</p>
    </div>
  )
}

export default SongItem