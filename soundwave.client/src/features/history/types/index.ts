export interface ListenHistoryItem {
  trackId: number;
  title: string;
  imageUrl: string | null;
  audioUrl: string;
  artistId: number;
  artistName: string;
  durationSeconds: number;
  playCount: number;
  listenedAt: string;
}
