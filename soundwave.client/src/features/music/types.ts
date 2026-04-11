export interface Track {
    id: number;
    title: string;
    audioUrl: string;
    imageUrl: string;
    durationSeconds: number;
    artistName: string;
    artistId: number;
}

export interface Album {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    bgColor: string;
    tracks: Track[];
}