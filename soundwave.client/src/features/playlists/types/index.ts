// features/playlists/types/index.ts

export interface PlaylistSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  trackCount: number;
  isLikedSongs: boolean;
  isPublic: boolean;
}

export interface PlaylistTrack {
  id: number;
  title: string;
  audioUrl: string;
  imageUrl: string;
  durationSeconds: number;
  artistName: string;
  artistId: number;
  albumTitle: string | null;
  addedAt: string;
  playCount: number;
}

export interface PlaylistDetails {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  isPublic: boolean;
  isLikedSongs: boolean;
  ownerId: number;
  ownerName: string;
  tracks: PlaylistTrack[];
}

export interface CreatePlaylistPayload {
  title?: string;
}

export interface UpdatePlaylistPayload {
  title?: string;
  description?: string;
  isPublic?: boolean;
  image?: File;
}
