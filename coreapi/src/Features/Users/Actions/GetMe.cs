using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoreApi.Features.Users.Actions;

[Handler, MapGet("/users/me")]
public static partial class GetMe
{
    public record Request;

    public record Response : SeadoxUser.Model
    {
        public required IReadOnlyCollection<string> Roles { get; set; }
    } 

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .RequireAuthorization()
        .WithTags(nameof(SeadoxUser))
        .WithDescription("Получение данных специфичных для Seadox Api");

    private static async ValueTask<Results<UnauthorizedHttpResult, Ok<Response>>> HandleAsync(
        Request _,
        CallerContext caller,
        CancellationToken ct)
    {
        var state = await caller.GetRequiredStateAsync(ct);
        return TypedResults.Ok(new Response
        {
            Id = state.User.Id,
            ZitadelId = state.User.ZitadelId,
            AvatarUrl = state.User.AvatarUrl,
            Color = state.User.Color,
            Roles = state.Roles
        });
    }
}