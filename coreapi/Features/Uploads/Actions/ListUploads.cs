using CoreApi.Features.Users;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Uploads.Actions;

[Handler, MapGet("/uploads/")]
public partial class ListUploads
{
    public record Request : Paginated.Request
    {
        public UploadScope? Scope { get; set; }
        public string? Query { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Upload))
        .RequireAuthorization();

    private static async ValueTask<Ok<Paginated.Response<Upload.Model>>> HandleAsync(
        Request request,
        CallerContext caller,
        DataContext dataContext,
        Upload.Mapper mapper,
        CancellationToken ct)
    {
        var userId = await caller.GetRequiredUserId(ct);
        var query = dataContext.Uploads
            .Where(x => x.UploaderId == userId);

        if (request.Scope is { } scope)
        {
            query = query.Where(x => x.Scope == scope);
        }
        
        if (string.IsNullOrWhiteSpace(request.Query) is false)
        {
            query = query.Where(x => EF.Functions.ILike(x.FileName, $"%{request.Query}%"));
        }

        return TypedResults.Ok(await query
            .OrderBy(x => x.UploadTime)
            .Project(mapper.ProjectToModel)
            .ToPaginatedResponseAsync(request, ct));
    }
}