using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Features.Docs.Actions;

[Handler, MapGet("seadocs/")]
public static partial class ListDocs
{
    public record Request : Paginated.Request
    {
        public required QueryOptional<string> Prompt { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc));

    private static async ValueTask<Ok<Paginated.Response<Seadoc.Info>>> HandleAsync(
        Request request,
        CallerContext caller,
        DataContext dataContext,
        Seadoc.Mapper mapper,
        CancellationToken ct)
    {
        var state = await caller.GetCurrentStateAsync(ct);
        var query = dataContext.DocsVisibleTo(state);

        if (request.Prompt.Value.IsNot(string.IsNullOrWhiteSpace, out var prompt))
        {
            // ReSharper disable once EntityFramework.ClientSideDbFunctionCall
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{prompt}%"));
        }

        if (state?.IsInRole(RoleNames.Admin) is not true)
        {
            query = query.Where(x => x.IsIndexed);
        }

        return TypedResults.Ok(await query
            .OrderByDescending(x => x.UpdatedAt)
            .Project(mapper.ProjectToInfo)
            .ToPaginatedResponseAsync(request, ct));
    }
}