using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Net.Http.Headers;

namespace CoreApi.Features.Uploads.Actions;

[Handler, MapGet("/uploads/{Id}")]
public partial class GetFileContent
{
    public record Request
    {
        public required TextId Id { get; set; }
        public required HttpContext HttpContext { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Upload));

    private static async ValueTask<Results<NotFound, FileStreamHttpResult>> HandleAsync(
        Request request,
        HybridCache cache,
        DataContext dataContext,
        TextIdEncoders encoders,
        Upload.Mapper mapper,
        S3FileStorage storage,
        CancellationToken ct)
    {
        if (encoders.Uploads.DecodeTextId(request.Id) is not { } uploadId)
        {
            return TypedResults.NotFound();
        }

        var upload = await cache.GetOrCreateAsync(Upload.CacheKey(uploadId), async innerCt =>
        {
            return await dataContext.Uploads
                .Where(x => x.Id == uploadId)
                .Project(mapper.ProjectToModel)
                .FirstOrDefaultAsync(innerCt);
        }, cancellationToken: ct);
        if (upload is null)
        {
            return TypedResults.NotFound();
        }

        var contentStream = await storage.GetFileStream(upload.Hash, ct);
        request.HttpContext.Response.Headers.CacheControl = CacheControlHeaderValue.PublicString;
        return TypedResults.Stream(
            contentStream,
            upload.ContentType,
            upload.FileName,
            upload.UploadTime,
            EntityTagHeaderValue.Parse($"\"{upload.Hash.Value}\""));
    }
}