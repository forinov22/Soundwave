using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Soundwave.Api.Controllers;

// Утилиты для контроллеров, которые работают от имени артиста.
// Вынесено в базовый класс, чтобы не плодить копии GetArtistId().
public abstract class BaseApiController : ControllerBase
{
    protected int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }

    // 401 если в токене нет id, иначе возвращает int через out.
    // Использовать в начале защищённых методов: if (!TryGetUserId(out var id)) return Unauthorized();
    protected bool TryGetUserId(out int userId)
    {
        var maybe = GetUserId();
        userId = maybe ?? 0;
        return maybe.HasValue;
    }
}