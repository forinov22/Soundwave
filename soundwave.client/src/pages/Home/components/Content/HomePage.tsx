import {useEffect} from "react";
import { useNavigate } from "react-router";

import AlbumItem from "@/shared/ui/AlbumItem";
import SongItem from "@/shared/ui/SongItem";
import {useMusic} from "@/features/music/lib/useMusic.ts";

import Navbar from "./Navbar";

const HomePage = () => {
    // TODO: add error handling
    const { trendingTracks, popularAlbums, fetchHome, isLoading } = useMusic();

    useEffect(() => {
        fetchHome();
    }, [fetchHome]);
    
  const navigate = useNavigate();

  const handleAlbumClick = (id: number) => {
    navigate(`/album/${id}`);
  };

    if (isLoading) {
        // TODO: add sceleton
        return <div className="text-white">Loading music...</div>;
    }

  return (
    <>
      <Navbar />
      <div className="mb-4">
        <h1 className="my-5 text-2xl font-bold">Featured Charts</h1>
        <div className="flex overflow-auto">
          {popularAlbums.map((album) => (
            <AlbumItem
              key={album.id}
              // id={album.id}
              name={album.title}
              description={album.description}
              image={album.imageUrl}
              onClick={() => handleAlbumClick(album.id)}
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h1 className="my-5 text-2xl font-bold">Today's Biggest Hits</h1>
        <div className="flex overflow-auto">
          {trendingTracks.map((track) => (
            <SongItem
              key={track.id}
              // id={album.id}
              name={track.title}
              description={'description'}
              image={track.imageUrl}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
