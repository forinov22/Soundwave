using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IReleaseService
{
    // Чтение
    // Релиз с треками — для редактирования артистом и для деталей профиля.
    // Витринные методы для слушателей живут в IMusicService.
    Task<Release?> GetByIdWithTracksAsync(int id);
    Task<IEnumerable<Release>> GetMyDraftsAsync(int artistId);
    Task<IEnumerable<Release>> GetMyPublishedAsync(int artistId);

    // Создание черновика. Обложка опциональна — у сингла унаследуется от трека.
    Task<Release> CreateDraftAsync(
        int artistId,
        string title,
        string? description,
        DateTime? releaseDate,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType);

    // Обновление метаданных. Только для черновика (Status == Draft).
    Task<Release> UpdateDraftAsync(
        int releaseId,
        int artistId,
        string? title,
        string? description,
        DateTime? releaseDate,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType);

    // Состав треков. Только для черновика.
    Task AddTrackAsync(int releaseId, int artistId, int trackId);
    Task RemoveTrackAsync(int releaseId, int artistId, int trackId);
    Task ReorderTracksAsync(int releaseId, int artistId, IList<int> trackIdsInOrder);

    // Публикация. Проверяет инварианты:
    //  - есть хотя бы 1 трек
    //  - title не пуст
    //  - обложка есть (своя или, для сингла, у трека)
    //  - ни один трек не опубликован в другом релизе
    Task<Release> PublishAsync(int releaseId, int artistId);

    // Удаление:
    //  - Draft  → hard delete вместе с ReleaseTracks (cascade)
    //  - Published → soft delete (Status = Archived)
    //  - Archived → ничего, идемпотентно
    Task DeleteAsync(int releaseId, int artistId);
}