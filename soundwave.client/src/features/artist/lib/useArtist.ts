import { useAsync } from "@/shared/hooks/useAsync";

import { artistApi } from "../api/artistApi";
import type { CreateTrackPayload } from "../types/CreateTrackPayload";
import type { CreateAlbumPayload } from "../types/CreateAlbumPayload";
import type { ArtistAlbum } from "../types/ArtistAlbum";
import { useArtistStore } from "../model/artistStore";

export function useArtist() {
  const {
    tracks,
    albums,
    setTracks,
    setAlbums,
    addTrack,
    addAlbum,
    removeTrack,
    removeAlbum,
  } = useArtistStore();

  // ── Загрузка треков ──────────────────────────────────────────────────────
  const {
    execute: fetchMyTracks,
    isLoading: isTracksLoading,
    error: tracksError,
  } = useAsync(async () => {
    const res = await artistApi.getMyTracks();
    setTracks(res.data);
    return res.data;
  });

  // ── Загрузка альбомов ────────────────────────────────────────────────────
  const {
    execute: fetchMyAlbums,
    isLoading: isAlbumsLoading,
    error: albumsError,
  } = useAsync(async () => {
    const res = await artistApi.getMyAlbums();
    const mapped: ArtistAlbum[] = res.data.map((a) => ({
      id: a.id,
      name: a.name,
      imageUrl: a.imageUrl ?? null,
      releaseYear: new Date(a.releaseYear ?? Date.now())
        .getFullYear()
        .toString(),
      tracks: a.tracks ?? [],
    }));
    setAlbums(mapped);
    return mapped;
  });

  // ── Создание трека ───────────────────────────────────────────────────────
  const {
    execute: createTrack,
    isLoading: isCreatingTrack,
    error: createTrackError,
  } = useAsync(async (payload: CreateTrackPayload) => {
    const res = await artistApi.createTrack(payload);
    // Сразу кладём в стор — компоненты обновятся без колбэков
    addTrack(res.data);
    return res.data;
  });

  // ── Создание альбома ─────────────────────────────────────────────────────
  const {
    execute: createAlbum,
    isLoading: isCreatingAlbum,
    error: createAlbumError,
  } = useAsync(async (payload: CreateAlbumPayload) => {
    const res = await artistApi.createAlbum(payload);
    const album: ArtistAlbum = {
      id: res.data.id,
      name: res.data.name,
      imageUrl: res.data.imageUrl ?? null,
      releaseYear: new Date(res.data.releaseYear ?? Date.now())
        .getFullYear()
        .toString(),
      tracks: [],
    };
    addAlbum(album);
    return res.data;
  });

  // ── Удаление (пока локальное) ────────────────────────────────────────────
  const deleteTrack = (trackId: number) => {
    // TODO: DELETE /api/tracks/{id}
    removeTrack(trackId);
  };

  const deleteAlbum = (albumId: number) => {
    // TODO: DELETE /api/albums/{id}
    removeAlbum(albumId);
  };

  return {
    // Данные из стора — реактивны для всех компонентов
    tracks,
    albums,

    fetchMyTracks,
    isTracksLoading,
    tracksError,

    fetchMyAlbums,
    isAlbumsLoading,
    albumsError,

    createTrack,
    isCreatingTrack,
    createTrackError,

    createAlbum,
    isCreatingAlbum,
    createAlbumError,

    deleteTrack,
    deleteAlbum,
  };
}
