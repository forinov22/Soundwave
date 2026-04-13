import { useEffect, useCallback, useMemo } from "react"; // Добавили мемоизацию
import { useShallow } from "zustand/react/shallow";

import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { useAsync } from "@/shared/hooks/useAsync";
import { musicApi } from "@/features/music/api/musicApi";

import { useSidebarStore } from "../model/sidebarStore";
import type { SidebarView } from "../types";

export function useRightSidebar() {
  const { currentTrack } = usePlayerPlayback();

  const { execute, isLoading, error } = useAsync(musicApi.getArtistInfo);

  const {
    view,
    setView,
    artistDetails,
    setArtistDetails,
    addToCache,
    artistCache,
  } = useSidebarStore(
    useShallow((state) => ({
      view: state.view,
      setView: state.setView,
      artistDetails: state.artistDetails,
      setArtistDetails: state.setArtistDetails,
      addToCache: state.addToCache,
      artistCache: state.artistCache,
    })),
  );

  useEffect(() => {
    if (isLoading || view !== "trackInfo" || !currentTrack?.artistId) return;

    const artistId = String(currentTrack.artistId);

    if (artistDetails?.id === currentTrack.artistId) return;

    if (artistCache.has(artistId)) {
      setArtistDetails(artistCache.get(artistId) ?? null);
      return;
    }

    const load = async () => {
      try {
        const { data } = await execute(artistId);
        setArtistDetails(data);
        addToCache(data);
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [
    view,
    isLoading,
    currentTrack?.artistId,
    artistDetails?.id,
    artistCache,
    execute,
    setArtistDetails,
    addToCache,
  ]);

  const toggle = useCallback(
    (targetView: SidebarView) => {
      setView(view === targetView ? null : targetView);
    },
    [view, setView],
  );

  const close = useCallback(() => setView(null), [setView]);

  return useMemo(
    () => ({
      view,
      isOpen: view !== null,
      artistDetails,
      isLoading,
      error,
      toggle,
      close,
    }),
    [view, artistDetails, isLoading, error, toggle, close],
  );
}
