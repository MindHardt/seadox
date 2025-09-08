using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace CoreApi.Features.Uploads.Actions;

[Handler, MapDelete("/uploads/{Id}")]
public partial class DeleteUpload
{
    public record Request
    {
        public required TextId Id { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Upload))
        .RequireAuthorization();

    private static async ValueTask<Results<Ok, NotFound, ForbidHttpResult>> HandleAsync(
        Request request,
        TextIdEncoders encoders,
        DataContext dataContext,
        HybridCache cache,
        S3FileStorage storage,
        CallerContext caller,
        CancellationToken ct)
    {
        if (encoders.Uploads.DecodeTextId(request.Id) is not { } id)
        {
            return TypedResults.NotFound();
        }
        
        var upload = await dataContext.Uploads.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (upload is null)
        {
            return TypedResults.NotFound();
        }

        var userId = await caller.GetRequiredUserId(ct);
        if (upload.UploaderId != userId)
        {
            return TypedResults.Forbid();
        }
        
        dataContext.Uploads.Remove(upload);
        await dataContext.SaveChangesAsync(ct);
        await cache.RemoveAsync(Upload.CacheKey(id), ct);
        
        var hashUsed = await dataContext.Uploads
            .AnyAsync(x => x.Hash == upload.Hash, ct);
        if (hashUsed is false)
        {
            await storage.DeleteAttachment(upload.Hash, ct);
        }
        
        return TypedResults.Ok();
    }
}