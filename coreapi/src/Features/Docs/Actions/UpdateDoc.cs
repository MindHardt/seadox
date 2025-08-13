using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs.Actions;

public class UpdateDoc
{
    public record Request
    {
        public required TextId Id { get; set; }
        public required Body Content { get; set; }
        
        public record Body
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
        }
    }

    private static async ValueTask<Results<NotFound, Ok<Seadoc.Model>>> HandleAsync(
        Request request,
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
        var doc = await dataContext.DocsEditableBy(state)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }

        doc.Name = request.Content.Name ?? doc.Name;
        doc.Description = request.Content.Description ?? doc.Description;
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, ct));
    }
}