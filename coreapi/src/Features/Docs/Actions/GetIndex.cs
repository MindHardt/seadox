using CoreApi.Features.Users;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs.Actions;

[Handler, MapGet("/seadocs/index")]
public partial class GetIndex
{
    public record Request;

    public record Response
    {
        public required IReadOnlyCollection<Seadoc.Info> Root { get; set; }
        public required IReadOnlyCollection<Seadoc.Info> Bookmarks { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc))
        .RequireAuthorization();

    private static async ValueTask<Ok<Response>> HandleAsync(
        Request _,
        CallerContext caller,
        DataContext dataContext,
        Seadoc.Mapper mapper,
        CancellationToken ct)
    {
        var userId = await caller.GetRequiredUserId(ct);
        return TypedResults.Ok(new Response
        {
            Root = await dataContext.Seadocs
                .Where(x => x.OwnerId == userId && x.ParentId == null)
                .OrderByDescending(x => x.CreatedAt)
                .Project(mapper.ProjectToInfo)
                .ToListAsync(ct),
            Bookmarks = await dataContext.Bookmarks
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => x.Doc!)
                .Project(mapper.ProjectToInfo)
                .ToListAsync(ct)
        });
    }
}