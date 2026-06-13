import type { Track } from "./Track";

// Соответствует ReleaseStatus на бэке (enum в C#).
// Используем literal union, чтобы TypeScript мог сужать типы по статусу.
export type ReleaseStatus = "Draft" | "Published" | "Archived";

// Соответствует ReleaseType на бэке. Считается из количества треков.
export type ReleaseType = "Single" | "EP" | "Album";

// Лёгкий релиз для витрин и списков. Без треков.
// Соответствует ReleaseDto на бэке.
export interface Release {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  bgColor: string;
  status: ReleaseStatus;
  type: ReleaseType;
  releaseDate: string | null; // ISO от бэка
  publishedAt: string | null;
  trackCount: number;
  artistId: number;
  artistName: string;
}

// Детальный релиз с треками.
// Соответствует ReleaseDetailsDto на бэке.
export interface ReleaseDetails {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  bgColor: string;
  status: ReleaseStatus;
  type: ReleaseType;
  releaseDate: string | null;
  publishedAt: string | null;
  artistId: number;
  artistName: string;
  tracks: Track[];
}
