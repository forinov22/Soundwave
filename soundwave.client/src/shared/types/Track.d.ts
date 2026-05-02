// Базовый трек, как его видит слушатель.
// Соответствует TrackDto на бэке (Soundwave.Api/DTOs/TrackDtos.cs).
export interface Track {
  id: number;
  title: string;
  audioUrl: string;
  imageUrl: string;
  durationSeconds: number;
  artistName: string;
  artistId: number;
}
