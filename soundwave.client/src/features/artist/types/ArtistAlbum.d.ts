export interface ArtistAlbum {
  id: number;
  name: string;
  imageUrl: string | null;
  releaseYear: string;
  tracks: Track[];
}
