using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs.Actions;

[Handler, MapPost("/seadocs/")]
public partial class CreateDoc
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
        var userId = encoders.User.DecodeRequiredTextId(state.User.Id);
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
            OwnerId = userId,
            ParentId = parentId
        };
        dataContext.Seadocs.Add(doc);
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, ct));
    }
}