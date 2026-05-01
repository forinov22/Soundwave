import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";

import type { CreateTrackPayload } from "../types/CreateTrackPayload";
import type { CreateAlbumPayload } from "../types/CreateAlbumPayload";
import type { ArtistAlbum } from "../types/ArtistAlbum";

export const artistApi = {
  // Треки и альбомы текущего авторизованного артиста
  getMyTracks: () => apiClient.get<Track[]>("/api/artist/me/tracks"),

  getMyAlbums: () => apiClient.get<ArtistAlbum[]>("/api/artist/me/albums"),

  // POST /api/tracks  — multipart/form-data
  createTrack: (payload: CreateTrackPayload) => {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("audio", payload.audio);
    form.append("image", payload.image);
    if (payload.albumId !== undefined) {
      form.append("albumId", String(payload.albumId));
    }
    return apiClient.post<Track>("/api/tracks", form);
  },

  // POST /api/albums  — multipart/form-data
  createAlbum: (payload: CreateAlbumPayload) => {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("image", payload.image);
    if (payload.description) form.append("description", payload.description);
    if (payload.releaseDate) form.append("releaseDate", payload.releaseDate);
    return apiClient.post<ArtistAlbum>("/api/albums", form);
  },
};
