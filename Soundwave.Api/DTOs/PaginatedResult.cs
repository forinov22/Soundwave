namespace Soundwave.Api.DTOs;

// Универсальная обёртка для пагинированных ответов.
// Использование: return Ok(PaginatedResult.From(items, total, page, pageSize));
public record PaginatedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
)
{
    public static PaginatedResult<T> From(
        IEnumerable<T> items,
        int totalCount,
        int page,
        int pageSize)
    {
        var list = items as IReadOnlyList<T> ?? items.ToList();
        var totalPages = pageSize > 0
            ? (int)Math.Ceiling((double)totalCount / pageSize)
            : 0;

        return new PaginatedResult<T>(list, totalCount, page, pageSize, totalPages);
    }
}