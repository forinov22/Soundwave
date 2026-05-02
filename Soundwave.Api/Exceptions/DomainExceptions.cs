namespace Soundwave.Api.Exceptions;

// Базовый класс для ошибок бизнес-логики.
// Контроллер маппит их в HTTP-коды через ExceptionFilter.
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
}

// 404
public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) { }
}

// 403 — попытка трогать чужие данные
public class ForbiddenException : DomainException
{
    public ForbiddenException(string message) : base(message) { }
}

// 400 — нарушение бизнес-правил
public class ValidationException : DomainException
{
    public ValidationException(string message) : base(message) { }
}

// 409 — конфликт состояния (трек используется в черновиках, и т.п.)
public class ConflictException : DomainException
{
    public object? Details { get; }

    public ConflictException(string message, object? details = null) : base(message)
    {
        Details = details;
    }
}