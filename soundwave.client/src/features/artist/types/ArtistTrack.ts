import type { Track } from "@/shared/types/Track";
import type { ReleaseStatus } from "@/shared/types/Release";

// Краткая ссылка на релиз для отображения в плейграунде.
// Соответствует TrackReleaseRefDto на бэке.
export interface TrackReleaseRef {
  id: number;
  title: string;
  status: ReleaseStatus;
}

// Трек на странице артиста (плейграунд) — со списком релизов,
// в которые он входит. Используется для бейджа статуса
// и для решения, можно ли удалить.
//
// Соответствует ArtistTrackDto на бэке.
export interface ArtistTrack extends Track {
  createdAt: string;
  releases: TrackReleaseRef[];
}

// Удобные предикаты — лучше держать рядом с типом,
// чтобы UI не реализовывал эту логику снова и снова.

export const isFreeTrack = (t: ArtistTrack): boolean => t.releases.length === 0;

export const isPublishedTrack = (t: ArtistTrack): boolean =>
  t.releases.some((r) => r.status === "Published");

export const getDraftReleases = (t: ArtistTrack): TrackReleaseRef[] =>
  t.releases.filter((r) => r.status === "Draft");

export const getPublishedReleases = (t: ArtistTrack): TrackReleaseRef[] =>
  t.releases.filter((r) => r.status === "Published");
