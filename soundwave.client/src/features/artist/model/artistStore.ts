import { create } from "zustand";

import type { ReleaseDetails, ReleaseStatus } from "@/shared/types/Release";

import type { ArtistTrack, TrackReleaseRef } from "../types/ArtistTrack";

interface ArtistState {
  // ── Данные ───────────────────────────────────────────────────────────────
  tracks: ArtistTrack[]; // плейграунд
  drafts: ReleaseDetails[]; // мои черновики
  published: ReleaseDetails[]; // мои опубликованные + архивные

  // ── Сеттеры (после фетча) ────────────────────────────────────────────────
  setTracks: (tracks: ArtistTrack[]) => void;
  setDrafts: (drafts: ReleaseDetails[]) => void;
  setPublished: (published: ReleaseDetails[]) => void;

  // ── Треки ────────────────────────────────────────────────────────────────
  addTrack: (track: ArtistTrack) => void;
  removeTrack: (trackId: number) => void;

  // ── Релизы ───────────────────────────────────────────────────────────────
  addDraft: (release: ReleaseDetails) => void;
  // Универсальный апдейт релиза — может находиться в drafts или published.
  // После публикации статус меняется и релиз "переезжает" из drafts в published.
  upsertRelease: (release: ReleaseDetails) => void;
  removeRelease: (releaseId: number) => void;

  // ── Кросс-обновление: релиз изменился → обновить ссылки на него в треках ──
  // Используется после addTrackToRelease/removeTrackFromRelease,
  // чтобы плейграунд показал актуальные бейджи без перезапроса.
  syncTrackReleaseRefs: (release: ReleaseDetails) => void;
}

// Утилита: построить TrackReleaseRef из релиза. Используется в syncTrackReleaseRefs.
const refOf = (r: ReleaseDetails): TrackReleaseRef => ({
  id: r.id,
  title: r.title,
  status: r.status,
});

export const useArtistStore = create<ArtistState>((set) => ({
  tracks: [],
  drafts: [],
  published: [],

  setTracks: (tracks) => set({ tracks }),
  setDrafts: (drafts) => set({ drafts }),
  setPublished: (published) => set({ published }),

  addTrack: (track) => set((s) => ({ tracks: [track, ...s.tracks] })),

  removeTrack: (trackId) =>
    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== trackId),
      // Также вычищаем из всех release.tracks. Драфты могут потерять
      // трек, если он был удалён force-ом — UI не должен видеть фантомов.
      drafts: s.drafts.map((r) => ({
        ...r,
        tracks: r.tracks.filter((t) => t.id !== trackId),
      })),
    })),

  addDraft: (release) => set((s) => ({ drafts: [release, ...s.drafts] })),

  upsertRelease: (release) =>
    set((s) => {
      const isDraft = release.status === "Draft";
      const isPublished: ReleaseStatus[] = ["Published", "Archived"];
      const goesToPublished = isPublished.includes(release.status);

      // Чистим обе коллекции от старой версии
      const drafts = s.drafts.filter((r) => r.id !== release.id);
      const published = s.published.filter((r) => r.id !== release.id);

      if (isDraft) {
        return { drafts: [release, ...drafts], published };
      }
      if (goesToPublished) {
        return { drafts, published: [release, ...published] };
      }
      return { drafts, published };
    }),

  removeRelease: (releaseId) =>
    set((s) => ({
      drafts: s.drafts.filter((r) => r.id !== releaseId),
      published: s.published.filter((r) => r.id !== releaseId),
      // Убираем ссылку на этот релиз из всех треков плейграунда
      tracks: s.tracks.map((t) => ({
        ...t,
        releases: t.releases.filter((r) => r.id !== releaseId),
      })),
    })),

  syncTrackReleaseRefs: (release) =>
    set((s) => {
      const ref = refOf(release);
      const trackIdsInRelease = new Set(release.tracks.map((t) => t.id));

      const updatedTracks = s.tracks.map((t) => {
        const wasIn = t.releases.some((r) => r.id === release.id);
        const isIn = trackIdsInRelease.has(t.id);

        if (!wasIn && !isIn) return t; // не касается этого трека
        if (wasIn && isIn) {
          // Возможно изменился title или статус релиза — обновим
          return {
            ...t,
            releases: t.releases.map((r) => (r.id === release.id ? ref : r)),
          };
        }
        if (!wasIn && isIn) {
          // Трек только что добавили в релиз
          return { ...t, releases: [...t.releases, ref] };
        }
        // wasIn && !isIn — трек убрали из релиза
        return {
          ...t,
          releases: t.releases.filter((r) => r.id !== release.id),
        };
      });

      return { tracks: updatedTracks };
    }),
}));
