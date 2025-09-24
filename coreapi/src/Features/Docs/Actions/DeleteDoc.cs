using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Docs.Actions;

[Handler, MapDelete($"/seadocs/{{{nameof(Request.Id)}}}")]
public static partial class DeleteDoc
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc))
        .RequireAuthorization();

    private static async ValueTask<Results<NotFound, UnprocessableEntity, Ok>> HandleAsync(
        [AsParameters] Request request,
        Seadoc.Mapper mapper,
        CallerContext caller,
        DataContext dataContext,
        CancellationToken ct)
    {
        if (mapper.Encoder.DecodeTextId(request.Id) is not { } id)
        {
            return TypedResults.NotFound();
        }

        var state = await caller.GetRequiredStateAsync(ct);
        var doc = await dataContext.DocsEditableBy(state).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }

        var childDocsExist = await dataContext.Seadocs.AnyAsync(x => x.ParentId == doc.Id, ct);
        if (childDocsExist)
        {
            return TypedResults.UnprocessableEntity();
        }

        dataContext.Seadocs.Remove(doc);
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok();
    }
}