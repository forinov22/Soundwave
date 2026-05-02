// Все пейлоады, которые отправляем на бэк из фичи артиста.
// Файлы (audio/image) идут как File — apiClient/artistApi обернут в FormData.

export interface CreateTrackPayload {
  title: string;
  audio: File;
  image: File;
}

export interface CreateReleasePayload {
  title: string;
  description?: string;
  releaseDate?: string; // ISO
  image?: File;
}

// PATCH-семантика: передаём только то, что меняется.
export interface UpdateReleasePayload {
  title?: string;
  description?: string;
  releaseDate?: string;
  image?: File;
}

// ── Кастомные ошибки 409 ────────────────────────────────────────────────────
//
// Бэк отвечает 409 в двух важных кейсах: при удалении трека из плейграунда
// и при публикации релиза с конфликтующими треками. Тело ответа имеет
// предсказуемый шейп — типизируем его, чтобы UI мог разобрать.

export interface DraftReleaseRef {
  id: number;
  title: string;
}

export interface DeleteTrackConflict {
  message: string;
  details: {
    draftReleases?: DraftReleaseRef[];
    publishedReleases?: DraftReleaseRef[];
  };
}

export interface PublishConflictItem {
  trackId: number;
  releaseId: number;
  releaseTitle: string;
}

export interface PublishConflict {
  message: string;
  details: {
    conflicts: PublishConflictItem[];
  };
}
