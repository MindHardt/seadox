using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Features.Uploads.Actions;

[Handler, MapGet("/uploads/")]
public static partial class ListUploads
{
    public record Request : Paginated.Request
    {
        public required QueryOptional<UploadScope> Scope { get; set; }
        public required QueryOptional<string> Prompt { get; set; }
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

        if (request.Scope.Value is { HasValue: true, Value: var scope })
        {
            query = query.Where(x => x.Scope == scope);
        }
        
        if (request.Prompt.Value.IsNot(string.IsNullOrWhiteSpace, out var prompt))
        {
            query = query.Where(x => EF.Functions.ILike(x.FileName, $"%{prompt}%"));
        }

        return TypedResults.Ok(await query
            .OrderBy(x => x.UploadTime)
            .Project(mapper.ProjectToModel)
            .ToPaginatedResponseAsync(request, ct));
    }
}