import { useEffect } from "react";

import { useAsync } from "@/shared/hooks/useAsync";
import type { Track } from "@/shared/types/Track";
import type { ArtistPublicProfile } from "../types";
import { artistPublicApi } from "../api/artistPublicApi";
import { useArtistPublicStore } from "../model/artistPublicStore";

interface UseArtistPublicReturn {
  profile: ArtistPublicProfile | null;
  popularTracks: Track[];
  isLoading: boolean;
  error: string | null;
}

export function useArtistPublic(artistId: number): UseArtistPublicReturn {
  const store = useArtistPublicStore();

  const profile = store.getProfile(artistId) ?? null;
  const popularTracks = store.getPopularTracks(artistId) ?? [];

  const { execute, isLoading, error } = useAsync(async (id: number) => {
    const [profileRes, tracksRes] = await Promise.all([
      artistPublicApi.getProfile(id),
      artistPublicApi.getPopularTracks(id, 5),
    ]);
    store.setProfile(profileRes.data);
    store.setPopularTracks(id, tracksRes.data);
  });

  useEffect(() => {
    // Если уже есть в сторе — не перезапрашиваем
    if (!profile) {
      execute(artistId);
    }
  }, [artistId, profile, execute]);

  return {
    profile,
    popularTracks,
    isLoading: isLoading && !profile,
    error,
  };
}
