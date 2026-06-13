namespace Soundwave.Api.DTOs;

// Используется для ответов на toggle-запросы
public record LikeResultDto(bool Liked);
public record FollowResultDto(bool Followed);
public record SavedResultDto(bool Saved);
