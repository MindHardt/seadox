using CoreApi.Features.Colors;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace CoreApi.Features.Users.Actions;

[Handler, MapPatch("/users/me")]
public static partial class UpdateMe
{
    public record Request
    {
        public Color? Color { get; set; }
        public string? AvatarUrl { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .RequireAuthorization()
        .WithTags(nameof(SeadoxUser))
        .WithDescription("Изменение профиля в Seadox");

    private static async ValueTask<Ok<SeadoxUser.Model>> HandleAsync(
        Request request,
        CallerContext caller,
        DataContext dataContext,
        HybridCache cache,
        SeadoxUser.Mapper mapper,
        CancellationToken ct)
    {
        var userId = await caller.GetRequiredUserId(ct);
        var user = await dataContext.Users.FirstAsync(x => x.Id == userId, ct);

        user.AvatarUrl = request.AvatarUrl ?? user.AvatarUrl;
        user.Color = request.Color ?? user.Color;
        await dataContext.SaveChangesAsync(ct);
        await cache.RemoveAsync(user.GetCacheKey(), ct);

        return TypedResults.Ok(mapper.ToModel(user));
    }
}