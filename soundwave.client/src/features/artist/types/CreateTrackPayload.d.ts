export interface CreateTrackPayload {
  title: string;
  albumId?: number;
  audio: File;
  image: File;
}
