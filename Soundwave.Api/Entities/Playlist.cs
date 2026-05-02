namespace Soundwave.Api.Entities;

public class Playlist
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string ImageS3Path { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Инвариант: в плейлисте могут быть только опубликованные треки.
    //  - На запись (PlaylistService.AddTrack): валидируем, что трек входит
    //    хотя бы в один Published-релиз. Иначе 400.
    //  - При архивации релиза (ReleaseService.DeleteAsync): треки этого
    //    релиза автоматически убираются из всех плейлистов.
    //  - На чтение: фильтрация не нужна — БД уже консистентна.
    public ICollection<Track> Tracks { get; set; } = [];
}