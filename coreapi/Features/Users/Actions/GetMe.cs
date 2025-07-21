using System.Security.Claims;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace CoreApi.Features.Users.Actions;

[Handler, MapGet("/users/me")]
public partial class GetMe
{
    public record Request;

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .RequireAuthorization()
        .WithTags(nameof(SeadoxUser))
        .WithDescription("Получение данных специфичных для Seadox Api");

    private static async ValueTask<Ok<CallerContext.State?>> HandleAsync(
        Request _,
        CallerContext caller,
        CancellationToken ct)
    {
        var state = await caller.GetCurrentStateAsync(ct);
        return TypedResults.Ok(state);
    }
}