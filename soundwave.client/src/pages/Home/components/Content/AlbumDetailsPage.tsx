import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router";
import { CircleAlert } from "lucide-react";

import { albumsData, songsData } from "@/assets/assets";
import spotify_logo from "@/assets/spotify_logo.png";
import clock_icon from "@/assets/clock_icon.png";

import Navbar from "./Navbar";
import type { LayoutOutletContext } from "../../MainLayout";
import { usePlayerQueue } from "@/features/player/lib/usePlayerQueue";


function AlbumDetailsPage() {
  const { setGradientBgColor: setParentBgColor } = useOutletContext<LayoutOutletContext>();
  const { id: albumIdStr } = useParams();
  const { playTrack } = usePlayerQueue();

  const albumId = Number.parseInt(albumIdStr ?? "", 10);
  const albumData = albumsData.find((x) => x.id === albumId);

  useEffect(() => {
    setParentBgColor(albumData?.bgColor);

    return () => setParentBgColor();
  }, [setParentBgColor, albumData?.bgColor])

  if (!albumData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <CircleAlert className="size-15" />
        <h2 className="font-bold text-4xl text-zinc-100">Не удалось найти альбом</h2>
        <p className="text-zinc-200">Попробуйте поискать что-нибудь другое.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-10 flex flex-col md:flex-row md:items-end gap-8">
        <img
          src={albumData.image}
          alt={albumData.name}
          className="w-48 rounded"
        />
        <div className="flex flex-col">
          <p>Playlist</p>
          <h2 className="mb-4 text-5xl md:text-7xl font-bold">
            {albumData.name}
          </h2>
          <h4>{albumData.desc}</h4>
          <p className="mt-1 flex items-center gap-2">
            <img
              src={spotify_logo}
              alt="spotify_logo"
              className="w-5 inline-block"
            />
            <b>Spotify</b> • 1,323,154 likes <b>• 50 songs,</b> about 2 hr 30 min
          </p>
        </div>
      </div>
      <div className="mt-10 mb-4 pl-2 grid grid-cols-3 sm:grid-cols-4 text-[#a7a7a7]">
        <p>
          <b className="mr-4">#</b>Title
        </p>
        <p>Album</p>
        <p className="hidden sm:block">Date Added</p>
        <img src={clock_icon} alt="clock_icon" className="w-4 m-auto" />
      </div>
      <hr />
      {songsData.map((s, idx) => (
        <div
          key={s.id}
          onClick={() => playTrack(s)}
          className="p-2 grid grid-cols-3 sm:grid-cols-4 items-center gap-2 hover:bg-[#ffffff2b] text-[#a7a7a7] cursor-pointer"
        >
          <p className="text-white">
            <b className="mr-4 text-[#a7a7a7]">{idx + 1}</b>
            <img src={s.image} alt={s.name} className="w-10 mr-5 inline" />
            {s.name}
          </p>
          <p className="text-[15px]">{albumData.name}</p>
          <p className="hidden sm:block text-[15px]">5 days ago</p>
          <p className="text-[15px] text-center">{s.duration}</p>
        </div>
      ))}
    </>
  );
};

export default AlbumDetailsPage;
