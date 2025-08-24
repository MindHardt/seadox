using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TextId = CoreApi.Infrastructure.TextIds.TextId;

namespace CoreApi.Features.Docs.Actions;

[Handler, MapGet($"seadocs/{{{nameof(Request.Id)}}}")]
public partial class GetDoc
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc));

    private static async ValueTask<Results<NotFound, Ok<Seadoc.Model>>> HandleAsync(
        Request request,
        CallerContext caller,
        TextIdEncoders encoders,
        DataContext dataContext,
        Seadoc.Mapper mapper,
        CancellationToken ct)
    {
        if (encoders.Seadocs.DecodeTextId(request.Id) is not { } docId)
        {
            return TypedResults.NotFound();
        }

        var state = await caller.GetCurrentStateAsync(ct);
        var doc = await dataContext.DocsVisibleTo(state).FirstOrDefaultAsync(x => x.Id == docId, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }
        
        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, state?.UserId, ct));
    }
}