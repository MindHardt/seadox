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

[Handler, MapPost($"seadocs/{{{nameof(Request.Id)}}}/bookmark")]
public static partial class AddBookmark
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

        var state = await caller.GetRequiredStateAsync(ct);
        var docExists = await dataContext.DocsVisibleTo(state).AnyAsync(x => x.Id == docId, ct);
        if (docExists is false)
        {
            return TypedResults.NotFound();
        }
        
        var bookmarkExists = await dataContext.Bookmarks
            .AnyAsync(x => x.UserId == state.UserId && x.DocId == docId, ct);
        if (bookmarkExists)
        {
            return TypedResults.Ok();
        }

        var bookmark = new DocBookmark
        {
            DocId = docId,
            UserId = state.UserId
        };
        dataContext.Bookmarks.Add(bookmark);
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok();
    }
}