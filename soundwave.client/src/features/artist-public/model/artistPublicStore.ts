import { create } from "zustand";
import type { Track } from "@/shared/types/Track";
import type { ArtistPublicProfile } from "../types";

interface ArtistPublicState {
  profiles: Record<number, ArtistPublicProfile>;
  popularTracks: Record<number, Track[]>;

  setProfile: (profile: ArtistPublicProfile) => void;
  setPopularTracks: (artistId: number, tracks: Track[]) => void;

  getProfile: (artistId: number) => ArtistPublicProfile | undefined;
  getPopularTracks: (artistId: number) => Track[] | undefined;
}

export const useArtistPublicStore = create<ArtistPublicState>((set, get) => ({
  profiles: {},
  popularTracks: {},

  setProfile: (profile) =>
    set((s) => ({ profiles: { ...s.profiles, [profile.id]: profile } })),

  setPopularTracks: (artistId, tracks) =>
    set((s) => ({ popularTracks: { ...s.popularTracks, [artistId]: tracks } })),

  getProfile: (artistId) => get().profiles[artistId],
  getPopularTracks: (artistId) => get().popularTracks[artistId],
}));
