export interface CreateAlbumPayload {
  title: string;
  description?: string;
  releaseDate?: string; // ISO date string
  image: File;
}
