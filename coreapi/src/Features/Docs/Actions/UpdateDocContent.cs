using System.Net.Mime;
using Amazon.S3.Model;
using CoreApi.Features.Uploads;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs.Actions;

[Handler, MapPut($"seadocs/{{{nameof(Request.Id)}}}/content")]
public static partial class UpdateDocContent
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
        
        public required IFormFile Content { get; set; }
    }
    
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Seadoc))
        .DisableAntiforgery()
        .RequireAuthorization();

    private static async ValueTask<Results<NotFound, Ok>> HandleAsync(
        [AsParameters] Request request,
        Seadoc.Mapper mapper,
        CallerContext caller,
        DataContext dataContext,
        S3FileStorage s3,
        CancellationToken ct)
    {
        if (mapper.Encoder.DecodeTextId(request.Id) is not { } id)
        {
            return TypedResults.NotFound();
        }

        var state = await caller.GetRequiredStateAsync(ct);
        var doc = await dataContext.DocsEditableBy(state).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }
        doc.UpdatedAt = DateTimeOffset.UtcNow;
        await dataContext.SaveChangesAsync(ct);

        await using var stream = request.Content.OpenReadStream();
        await s3.Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = s3.Options.BucketName,
            Key = S3FileStorage.DocsFolder + request.Id + ".yjs",
            InputStream = stream,
            ContentType = MediaTypeNames.Application.Octet
        }, ct);

        return TypedResults.Ok();
    }
}