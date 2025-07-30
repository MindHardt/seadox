using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Features.Uploads.Actions;

[Handler, MapPost("/uploads/")]
public partial class PostUpload
{
    public record Request
    {
        public required IFormFile File { get; set; }
        [FromForm]
        public required UploadScope Scope { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Upload))
        .DisableAntiforgery()
        .RequireAuthorization();
    
    public static readonly FileSize MaxUploadSize = FileSize.FromMegaBytes(10);

    private static async ValueTask<Results<UnprocessableEntity, Ok<Upload.Model>>> HandleAsync(
        [AsParameters] Request request,
        DataContext dataContext,
        CallerContext caller,
        Upload.Mapper mapper,
        S3FileStorage storage,
        CancellationToken ct)
    {
        var fileSize = request.File.Length;
        if (fileSize > MaxUploadSize.Bytes)
        {
            return TypedResults.UnprocessableEntity();
        }

        var userId = await caller.GetRequiredUserId(ct);
        var tempPath = Path.GetTempFileName();
        try
        {
            await using var tempFileStream = File.Open(tempPath, FileMode.Open, FileAccess.ReadWrite, FileShare.None);
            await request.File.CopyToAsync(tempFileStream, ct);
            tempFileStream.Seek(0, SeekOrigin.Begin);
            
            var hash = await Sha256HashString.CalculateAsync(tempFileStream, ct);
            if (await storage.FileExists(hash, ct) is false)
            {
                tempFileStream.Seek(0, SeekOrigin.Begin);
                await storage.SaveFile(tempFileStream, hash, ct);
            }

            var upload = new Upload
            {
                Hash = hash,
                ContentType = request.File.ContentType,
                FileName = request.File.FileName,
                Scope = request.Scope,
                FileSize = FileSize.FromBytes(fileSize),
                UploaderId = userId
            };
            dataContext.Uploads.Add(upload);
            await dataContext.SaveChangesAsync(ct);
            
            return TypedResults.Ok(mapper.ToModel(upload));
        }
        finally
        {
            File.Delete(tempPath);
        }
    }
}