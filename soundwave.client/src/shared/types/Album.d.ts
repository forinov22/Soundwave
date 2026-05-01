export interface Album {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  tracks: Track[];
}
