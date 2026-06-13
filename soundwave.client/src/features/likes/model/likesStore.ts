import { create } from "zustand";
import type { Release } from "@/shared/types/Release";
import type { PlaylistSummary } from "@/features/playlists/types";
import type { ArtistSummary } from "../types";

interface LikesState {
  likedReleaseIds: Set<number>;
  likedReleases: Release[];

  followedArtistIds: Set<number>;
  followedArtists: ArtistSummary[];

  savedPlaylistIds: Set<number>;
  savedPlaylists: PlaylistSummary[];

  // Релизы
  setLikedReleases: (releases: Release[]) => void;
  addLikedRelease: (release: Release) => void;
  removeLikedRelease: (id: number) => void;
  isReleaseLiked: (id: number) => boolean;

  // Артисты
  setFollowedArtists: (artists: ArtistSummary[]) => void;
  addFollowedArtist: (artist: ArtistSummary) => void;
  removeFollowedArtist: (id: number) => void;
  isArtistFollowed: (id: number) => boolean;

  // Плейлисты
  setSavedPlaylists: (playlists: PlaylistSummary[]) => void;
  addSavedPlaylist: (playlist: PlaylistSummary) => void;
  removeSavedPlaylist: (id: number) => void;
  isPlaylistSaved: (id: number) => boolean;
}

export const useLikesStore = create<LikesState>((set, get) => ({
  likedReleaseIds: new Set(),
  likedReleases: [],
  followedArtistIds: new Set(),
  followedArtists: [],
  savedPlaylistIds: new Set(),
  savedPlaylists: [],

  setLikedReleases: (releases) =>
    set({
      likedReleases: releases,
      likedReleaseIds: new Set(releases.map((r) => r.id)),
    }),
  addLikedRelease: (release) =>
    set((s) => ({
      likedReleases: [release, ...s.likedReleases],
      likedReleaseIds: new Set([...s.likedReleaseIds, release.id]),
    })),
  removeLikedRelease: (id) =>
    set((s) => {
      const ids = new Set(s.likedReleaseIds);
      ids.delete(id);
      return { likedReleases: s.likedReleases.filter((r) => r.id !== id), likedReleaseIds: ids };
    }),
  isReleaseLiked: (id) => get().likedReleaseIds.has(id),

  setFollowedArtists: (artists) =>
    set({
      followedArtists: artists,
      followedArtistIds: new Set(artists.map((a) => a.id)),
    }),
  addFollowedArtist: (artist) =>
    set((s) => ({
      followedArtists: [artist, ...s.followedArtists],
      followedArtistIds: new Set([...s.followedArtistIds, artist.id]),
    })),
  removeFollowedArtist: (id) =>
    set((s) => {
      const ids = new Set(s.followedArtistIds);
      ids.delete(id);
      return { followedArtists: s.followedArtists.filter((a) => a.id !== id), followedArtistIds: ids };
    }),
  isArtistFollowed: (id) => get().followedArtistIds.has(id),

  setSavedPlaylists: (playlists) =>
    set({
      savedPlaylists: playlists,
      savedPlaylistIds: new Set(playlists.map((p) => p.id)),
    }),
  addSavedPlaylist: (playlist) =>
    set((s) => ({
      savedPlaylists: [playlist, ...s.savedPlaylists],
      savedPlaylistIds: new Set([...s.savedPlaylistIds, playlist.id]),
    })),
  removeSavedPlaylist: (id) =>
    set((s) => {
      const ids = new Set(s.savedPlaylistIds);
      ids.delete(id);
      return { savedPlaylists: s.savedPlaylists.filter((p) => p.id !== id), savedPlaylistIds: ids };
    }),
  isPlaylistSaved: (id) => get().savedPlaylistIds.has(id),
}));
