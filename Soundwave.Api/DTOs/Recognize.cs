using System.Text.Json.Serialization;

namespace Soundwave.Api.DTOs;

public record RecognizeCandidate(
    [property: JsonPropertyName("track_id")] string TrackId,
    [property: JsonPropertyName("aligned_count")] int AlignedCount,
    [property: JsonPropertyName("total_matches")] int TotalMatches,
    [property: JsonPropertyName("alignment_fraction")] float AlignmentFraction,
    [property: JsonPropertyName("offset_seconds")] float OffsetSeconds
);

public record RecognizeResult(
    [property: JsonPropertyName("confident")] bool Confident,
    [property: JsonPropertyName("candidates")] List<RecognizeCandidate> Candidates
);
public record RecognizeResponse(
    bool Confident,
    TrackDto? BestMatch,
    List<TrackDto> Candidates
);
