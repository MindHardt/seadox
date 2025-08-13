using CoreApi.Features.Users;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs.Actions;

[Handler, MapGet("seadocs/")]
public partial class ListDocs
{
    public record Request : Paginated.Request
    {
        public string? Query { get; set; }
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

        if (string.IsNullOrWhiteSpace(request.Query) is false)
        {
            // ReSharper disable once EntityFramework.ClientSideDbFunctionCall
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{request.Query}%"));
        }

        return TypedResults.Ok(await query
            .OrderByDescending(x => x.CreatedAt)
            .Project(mapper.ProjectToInfo)
            .ToPaginatedResponseAsync(request, ct));
    }
}