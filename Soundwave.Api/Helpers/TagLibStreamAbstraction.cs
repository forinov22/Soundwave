namespace Soundwave.Api.Helpers;

internal sealed class TagLibStreamAbstraction : TagLib.File.IFileAbstraction
{
    private readonly Stream _stream;
 
    public TagLibStreamAbstraction(Stream stream)
    {
        _stream = stream;
        // TagLib требует имя файла — расширение важно для определения формата
        Name = "audio.mp3";
    }
 
    public string Name { get; }
    public Stream ReadStream => _stream;
    public Stream WriteStream => _stream;
 
    public void CloseStream(Stream stream)
    {
        // Не закрываем — стрим управляется снаружи
    }
}