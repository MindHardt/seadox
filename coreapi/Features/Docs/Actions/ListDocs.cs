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
        DataContext dataContext,
        Seadoc.Mapper mapper,
        CancellationToken ct)
    {
        var query = dataContext.Seadocs.AsQueryable();

        if (string.IsNullOrWhiteSpace(request.Query) is false)
        {
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{request.Query}%"));
        }

        return TypedResults.Ok(await query
            .OrderByDescending(x => x.CreatedAt)
            .Project(mapper.ProjectToInfo)
            .ToPaginatedResponseAsync(request, ct));
    }
}