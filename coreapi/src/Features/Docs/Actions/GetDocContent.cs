using System.Net.Mime;
using Amazon.S3;
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

[Handler, MapGet($"seadocs/{{{nameof(Request.Id)}}}/content")]
public partial class GetDocContent
{
    public record Request
    {
        [FromRoute]
        public required TextId Id { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .RequireAuthorization()
        .WithTags(nameof(Seadoc));

    private static async ValueTask<Results<NotFound, FileStreamHttpResult, NoContent>> HandleAsync(
        Request request,
        CallerContext caller,
        TextIdEncoders encoders,
        DataContext dataContext,
        S3FileStorage s3,
        CancellationToken ct)
    {
        if (encoders.Seadocs.DecodeTextId(request.Id) is not { } docId)
        {
            return TypedResults.NotFound();
        }

        var state = await caller.GetCurrentStateAsync(ct);
        var doc = await dataContext.DocsVisibleTo(state).FirstOrDefaultAsync(x => x.Id == docId, ct);
        if (doc is null)
        {
            return TypedResults.NotFound();
        }

        
        try
        {
            var additionalProperties = new Dictionary<string, object>();
            var result = await s3.Client.GetObjectStreamAsync(
                s3.Options.BucketName, 
                S3FileStorage.DocsFolder + request.Id + ".yjs", 
                additionalProperties, 
                ct);
            
            const string contentType = MediaTypeNames.Application.Octet;    
            var fileName = "seadoc_" + encoders.Seadocs.EncodeTextId(doc.Id);
            return TypedResults.File(result, contentType, fileName, lastModified: doc.UpdatedAt);
        }
        catch (AmazonS3Exception e) when (e.ErrorCode == "NoSuchKey")
        {
            return TypedResults.NoContent();
        }
    }
}