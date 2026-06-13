using Microsoft.Extensions.Options;
using Soundwave.Api.DTOs;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Services;

public class MlServiceClient
{
    private readonly HttpClient _http;
    private readonly string _internalToken;

    public MlServiceClient(HttpClient http, IOptions<MlServiceOptions> options)
    {
        _http = http;
        _internalToken = options.Value.InternalToken;
        
        if (string.IsNullOrWhiteSpace(_internalToken))
            throw new ArgumentException($"{nameof(options.Value.InternalToken)} is required");
    }

    /// <summary>Запускает обработку трека на Python-сервисе (fingerprint + embedding).</summary>
    public async Task<bool> StartProcessingAsync(string externalTrackId, string s3Key)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/tracks/{externalTrackId}/process");

        request.Headers.Add("X-Internal-Token", _internalToken);
        request.Content = JsonContent.Create(new { s3_key = s3Key });

        var response = await _http.SendAsync(request);
        return response.IsSuccessStatusCode; // 202
    }

    /// <summary>Удаляет данные трека из Python-сервиса.</summary>
    public async Task DeleteTrackAsync(string externalTrackId)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"/tracks/{externalTrackId}");
        request.Headers.Add("X-Internal-Token", _internalToken);
        await _http.SendAsync(request);
    }
    
    public async Task<RecognizeResult?> RecognizeAsync(Stream audioStream, string fileName, string contentType)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/recognize");
        request.Headers.Add("X-Internal-Token", _internalToken);

        var content = new MultipartFormDataContent();
        content.Add(new StreamContent(audioStream), "audio", fileName);
        request.Content = content;

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<RecognizeResult>();
    }
}
