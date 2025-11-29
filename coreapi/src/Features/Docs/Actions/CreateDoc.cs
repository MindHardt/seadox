using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Docs.Actions;

[Handler, MapPost("/seadocs/")]
public static partial class CreateDoc
{
    public record Request
    {
        public TextId? ParentId { get; set; }
        public required string Name { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc));

    private static async ValueTask<Results<Ok<Seadoc.Model>, NotFound>> HandleAsync(
        Request request,
        TextIdEncoders encoders,
        CallerContext caller,
        DataContext dataContext,
        Seadoc.Mapper mapper,
        CancellationToken ct)
    {
        int? parentId = null;
        if (request.ParentId is { } pid)
        {
            parentId = encoders.Seadocs.DecodeTextId(pid);
            if (parentId is null)
            {
                return TypedResults.NotFound();
            }
        }
        
        var state = await caller.GetRequiredStateAsync(ct);
        var userId = state.UserId;
        if (parentId is not null)
        {
            var parentAllowed = await dataContext.Seadocs
                .AnyAsync(x => x.Id == parentId && x.OwnerId == userId, ct);
            if (parentAllowed is false)
            {
                return TypedResults.NotFound();
            }
        }

        var doc = new Seadoc
        {
            Name = request.Name,
            Description = string.Empty,
            CoverUrl = null,
            OwnerId = userId,
            ParentId = parentId,
            Share = DocumentShareMode.Default
        };
        dataContext.Seadocs.Add(doc);
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, state, ct));
    }
}