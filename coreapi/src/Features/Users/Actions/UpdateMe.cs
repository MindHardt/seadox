using DotNext;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Seadox.CoreApi.Features.Colors;
using Seadox.CoreApi.Infrastructure.Data;

namespace Seadox.CoreApi.Features.Users.Actions;

[Handler, MapPatch("/users/me")]
public static partial class UpdateMe
{
    public record Request
    {
        public Optional<Color> Color { get; set; }
        public Optional<string?> AvatarUrl { get; set; }
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

        user.AvatarUrl = request.AvatarUrl.IsUndefined ? user.AvatarUrl : request.AvatarUrl.Or(null);
        user.Color = request.Color.If(c => c.IsInitialized()) | user.Color;
        await dataContext.SaveChangesAsync(ct);
        await cache.RemoveAsync(user.GetCacheKey(), ct);

        return TypedResults.Ok(mapper.ToModel(user));
    }
}