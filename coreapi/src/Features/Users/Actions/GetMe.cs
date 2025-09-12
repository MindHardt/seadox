using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoreApi.Features.Users.Actions;

[Handler, MapGet("/users/me")]
public static partial class GetMe
{
    public record Request;

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .RequireAuthorization()
        .WithTags(nameof(SeadoxUser))
        .WithDescription("Получение данных специфичных для Seadox Api");

    private static async ValueTask<Results<UnauthorizedHttpResult, Ok<SeadoxUser.Model>>> HandleAsync(
        Request _,
        CallerContext caller,
        CancellationToken ct)
    {
        var state = await caller.GetRequiredStateAsync(ct);
        return TypedResults.Ok(state.User);
    }
}