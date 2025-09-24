using Immediate.Handlers.Shared;

namespace Seadox.CoreApi.Infrastructure;

public class RequestLoggingBehavior<TRequest, TResponse>(ILogger<RequestLoggingBehavior<TRequest, TResponse>> logger)
    : Behavior<TRequest, TResponse>
    where TRequest: notnull
{
    public override ValueTask<TResponse> HandleAsync(TRequest request, CancellationToken ct)
    {
        using var scope = logger.BeginScope(request);
        return Next(request, ct);
    }
}