import { useAsync } from "@/shared/hooks/useAsync";

import { artistApi } from "../api/artistApi";
import { useArtistStore } from "../model/artistStore";
import type {
  CreateTrackPayload,
  CreateReleasePayload,
  UpdateReleasePayload,
} from "../types/Payloads";

// Главный хук фичи. Объединяет:
//  - чтение данных из стора (реактивно)
//  - фетчи (через useAsync для loading/error)
//  - мутации, после которых стор обновляется
//
// Удаление трека вынесено в отдельный useDeleteTrackWithConfirm —
// там обработка 409 со списком драфтов.
export function useArtist() {
  const {
    tracks,
    drafts,
    published,
    setTracks,
    setDrafts,
    setPublished,
    addTrack,
    removeTrack,
    addDraft,
    upsertRelease,
    removeRelease,
    syncTrackReleaseRefs,
  } = useArtistStore();

  // ── Фетчи ────────────────────────────────────────────────────────────────

  const fetchTracks = useAsync(async () => {
    const res = await artistApi.getMyTracks();
    setTracks(res.data);
    return res.data;
  });

  const fetchDrafts = useAsync(async () => {
    const res = await artistApi.getMyDrafts();
    setDrafts(res.data);
    return res.data;
  });

  const fetchPublished = useAsync(async () => {
    const res = await artistApi.getMyPublished();
    setPublished(res.data);
    return res.data;
  });

  // Фоновый refresh плейграунда — без флага загрузки, без ошибок наружу.
  // Используется после операций с релизами для гибридной синхронизации:
  // оптимистичный апдейт уже произошёл, а это контрольная сверка с бэком.
  const silentRefreshTracks = async () => {
    try {
      const res = await artistApi.getMyTracks();
      setTracks(res.data);
    } catch {
      // молча — это фоновая операция
    }
  };

  // ── Мутации: треки ───────────────────────────────────────────────────────

  const createTrack = useAsync(async (payload: CreateTrackPayload) => {
    const res = await artistApi.createTrack(payload);
    addTrack(res.data);
    return res.data;
  });

  // ── Мутации: релизы ──────────────────────────────────────────────────────

  const createDraft = useAsync(async (payload: CreateReleasePayload) => {
    const res = await artistApi.createRelease(payload);
    addDraft(res.data);
    return res.data;
  });

  const updateDraft = useAsync(
    async (releaseId: number, payload: UpdateReleasePayload) => {
      const res = await artistApi.updateRelease(releaseId, payload);
      upsertRelease(res.data);
      // Метаданные релиза могли поменяться (title) — обновим ссылки в треках
      syncTrackReleaseRefs(res.data);
      return res.data;
    },
  );

  // Состав релиза — оптимистичный апдейт + фоновый sync плейграунда
  const addTrackToRelease = useAsync(
    async (releaseId: number, trackId: number) => {
      const res = await artistApi.addTrackToRelease(releaseId, trackId);
      upsertRelease(res.data);
      syncTrackReleaseRefs(res.data);
      // Контрольная сверка с бэком — на случай если что-то ещё изменилось
      // (например, у трека появилась длительность после декодирования).
      void silentRefreshTracks();
      return res.data;
    },
  );

  const removeTrackFromRelease = useAsync(
    async (releaseId: number, trackId: number) => {
      const res = await artistApi.removeTrackFromRelease(releaseId, trackId);
      upsertRelease(res.data);
      syncTrackReleaseRefs(res.data);
      void silentRefreshTracks();
      return res.data;
    },
  );

  const reorderTracks = useAsync(
    async (releaseId: number, trackIds: number[]) => {
      const res = await artistApi.reorderTracks(releaseId, trackIds);
      upsertRelease(res.data);
      // Реордер не меняет состав — sync треков не нужен.
      return res.data;
    },
  );

  // Публикация переводит релиз из drafts в published — upsertRelease
  // сам разрулит переезд.
  const publishRelease = useAsync(async (releaseId: number) => {
    const res = await artistApi.publishRelease(releaseId);
    upsertRelease(res.data);
    syncTrackReleaseRefs(res.data);
    void silentRefreshTracks();
    return res.data;
  });

  // Удаление релиза. Бэк сам решает Draft → hard, Published → archive.
  // На фронте просто убираем из соответствующего списка.
  const deleteRelease = useAsync(async (releaseId: number) => {
    await artistApi.deleteRelease(releaseId);
    removeRelease(releaseId);
  });

  return {
    // Данные
    tracks,
    drafts,
    published,

    // Фетчи
    fetchTracks: fetchTracks.execute,
    isTracksLoading: fetchTracks.isLoading,
    tracksError: fetchTracks.error,

    fetchDrafts: fetchDrafts.execute,
    isDraftsLoading: fetchDrafts.isLoading,
    draftsError: fetchDrafts.error,

    fetchPublished: fetchPublished.execute,
    isPublishedLoading: fetchPublished.isLoading,
    publishedError: fetchPublished.error,

    // Низкоуровневые операции стора — для useDeleteTrackWithConfirm
    removeTrackFromStore: removeTrack,

    // Мутации: треки
    createTrack: createTrack.execute,
    isCreatingTrack: createTrack.isLoading,
    createTrackError: createTrack.error,

    // Мутации: релизы
    createDraft: createDraft.execute,
    isCreatingDraft: createDraft.isLoading,
    createDraftError: createDraft.error,

    updateDraft: updateDraft.execute,
    isUpdatingDraft: updateDraft.isLoading,
    updateDraftError: updateDraft.error,

    addTrackToRelease: addTrackToRelease.execute,
    isAddingTrackToRelease: addTrackToRelease.isLoading,
    addTrackToReleaseError: addTrackToRelease.error,

    removeTrackFromRelease: removeTrackFromRelease.execute,
    isRemovingTrackFromRelease: removeTrackFromRelease.isLoading,

    reorderTracks: reorderTracks.execute,
    isReorderingTracks: reorderTracks.isLoading,

    publishRelease: publishRelease.execute,
    isPublishing: publishRelease.isLoading,
    publishError: publishRelease.error,

    deleteRelease: deleteRelease.execute,
    isDeletingRelease: deleteRelease.isLoading,
  };
}
