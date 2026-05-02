using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Soundwave.Api.Exceptions;

namespace Soundwave.Api.Filters;

// Превращает исключения сервисного слоя в HTTP-ответы.
// Регистрируется глобально через AddControllers(o => o.Filters.Add<DomainExceptionFilter>()).
public class DomainExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        switch (context.Exception)
        {
            case NotFoundException nf:
                context.Result = new NotFoundObjectResult(new { message = nf.Message });
                context.ExceptionHandled = true;
                break;

            case ForbiddenException fb:
                context.Result = new ObjectResult(new { message = fb.Message })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                context.ExceptionHandled = true;
                break;

            case ValidationException ve:
                context.Result = new BadRequestObjectResult(new { message = ve.Message });
                context.ExceptionHandled = true;
                break;

            case ConflictException cf:
                // В тело попадают и сообщение, и Details (например, список черновиков
                // при удалении трека или конфликтующих релизов при публикации).
                context.Result = new ConflictObjectResult(new
                {
                    message = cf.Message,
                    details = cf.Details
                });
                context.ExceptionHandled = true;
                break;

            // Остальное — пусть летит дальше, ASP.NET вернёт 500.
        }
    }
}