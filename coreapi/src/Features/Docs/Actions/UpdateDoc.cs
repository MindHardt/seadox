using System.Text.Json.Serialization;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.Optionals;
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
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
            public Optional<string> Name { get; set; }
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
            public Optional<string> Description { get; set; }
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
            public Optional<string?> CoverUrl { get; set; }
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
            public Optional<bool> IsIndexed { get; set; }
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
            public Optional<DocumentShareMode> Share { get; set; }
        }
    }
    
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc))
        .RequireAuthorization();

    private static async ValueTask<Results<NotFound, Ok<Seadoc.Model>, ForbidHttpResult>> HandleAsync(
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
        if (request.Content.IsIndexed.HasValue && state.IsInRole(RoleNames.Admin) is false)
        {
            return TypedResults.Forbid();
        }
        
        var doc = await dataContext.DocsEditableBy(state).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }
        

        doc.Name = request.Content.Name.Or(doc.Name);
        doc.Description = request.Content.Description.Or(doc.Description);
        doc.IsIndexed = request.Content.IsIndexed.Or(doc.IsIndexed);
        doc.CoverUrl = request.Content.CoverUrl.Or(doc.CoverUrl);
        doc.Share = request.Content.Share.Or(doc.Share);
        doc.UpdatedAt = DateTimeOffset.UtcNow;
        await dataContext.SaveChangesAsync(ct);

        return TypedResults.Ok(await mapper.ToModelAsync(doc, dataContext, state, ct));
    }
}