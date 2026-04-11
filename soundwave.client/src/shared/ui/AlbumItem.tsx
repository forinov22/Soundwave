interface AlbumItemProps {
    // id: number;
    name: string;
    image: string;
    description: string;
    onClick: () => void;
};

const AlbumItem = ({
    // id,
    name,
    image,
    description,
    onClick,
}: AlbumItemProps) => {
  return (
    <div
        onClick={onClick}
        className="min-w-45 p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
    >
        <img src={image} alt={name} className="rounded" />
        <p className="mt-2 mb-1 font-bold">{name}</p>
        <p className="text-sm text-slate-200">{description}</p>
    </div>
  )
}

export default AlbumItem