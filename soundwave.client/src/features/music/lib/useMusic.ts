import { useAsync } from "@/shared/hooks/useAsync";

import { useMusicStore } from "../model/musicStore";
import { musicApi } from "../api/musicApi";

export function useMusic() {
    const {
        trendingTracks,
        popularAlbums,
        setTrendingTracks,
        setPopularAlbums
    } = useMusicStore();

    const { execute: fetchHome, isLoading, error } = useAsync(async () => {
        const [tracksRes, albumsRes] = await Promise.all([
            musicApi.getTrending(),
            musicApi.getPopularAlbums()
        ]);

        setTrendingTracks(tracksRes.data);
        setPopularAlbums(albumsRes.data);
    });

    const fetchAlbum = async (id: number) => {
        const res = await musicApi.getAlbumById(id);
        return res.data;
    };

    return {
        trendingTracks,
        popularAlbums,
        isLoading,
        error,
        fetchHome,
        fetchAlbum
    };
}
