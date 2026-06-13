export interface PlaylistSummary {
  id: number;
  title: string;
  imageUrl: string | null;
  trackCount: number;
  isLikedSongs: boolean;
  isPublic: boolean;
}
