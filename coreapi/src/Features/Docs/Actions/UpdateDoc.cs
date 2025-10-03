using DotNext;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Docs.Actions;

[Handler, MapPatch($"seadocs/{{{nameof(Request.Id)}}}")]
public static partial class UpdateDoc
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
        [FromBody]
        public required Body Content { get; set; }
        
        public record Body
        {
            public Optional<string> Name { get; set; }
            public Optional<string> Description { get; set; }
            public Optional<string?> CoverUrl { get; set; }
            public Optional<DocumentShareMode> Share { get; set; }
        }
    }
    
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc))
        .RequireAuthorization();

    private static async ValueTask<Results<NotFound, Ok<Seadoc.Model>>> HandleAsync(
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
        

        doc.Name = request.Content.Name | doc.Name;
        doc.Description = request.Content.Description | doc.Description;
        doc.CoverUrl = request.Content.CoverUrl.IsUndefined 
            ? doc.CoverUrl
            : request.Content.CoverUrl.Or(null);
        doc.Share = request.Content.Share | doc.Share;
        doc.UpdatedAt = DateTimeOffset.UtcNow;
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, state.UserId, ct));
    }
}