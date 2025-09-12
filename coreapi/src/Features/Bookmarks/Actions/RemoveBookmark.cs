using CoreApi.Features.Docs;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Bookmarks.Actions;

[Handler, MapDelete($"seadocs/{{{nameof(Request.Id)}}}/bookmark")]
public static partial class RemoveBookmark
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(DocBookmark))
        .RequireAuthorization();

    private static async ValueTask<Results<Ok, NotFound>> HandleAsync(
        [AsParameters] Request request,
        Seadoc.Mapper mapper,
        CallerContext caller,
        DataContext dataContext,
        CancellationToken ct)
    {
        if (mapper.Encoder.DecodeTextId(request.Id) is not { } docId)
        {
            return TypedResults.NotFound();
        }

        var userId = await caller.GetRequiredUserId(ct);
        var bookmark = await dataContext.Bookmarks.FirstOrDefaultAsync(
            x => x.DocId == docId && x.UserId == userId, ct);
        if (bookmark is null)
        {
            return TypedResults.NotFound();
        }
        
        dataContext.Bookmarks.Remove(bookmark);
        await dataContext.SaveChangesAsync(ct);
        
        return TypedResults.Ok();
    }
}