using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Primitives;

namespace Seadox.CoreApi.Features.Uploads.Actions;

[Handler, MapPost("/uploads/migrate")]
public static partial class MigrateUpload
{
    public record Request
    {
        [Url]
        public required string Url { get; set; }
        public required UploadScope Scope { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(nameof(Upload))
        .RequireAuthorization();

    private static async ValueTask<Results<UnprocessableEntity, Ok<Upload.Model>>> HandleAsync(
        Request request,
        HttpClient http,
        PostUpload.Handler handler,
        CancellationToken ct)
    {
        var res = await http.GetAsync(request.Url, ct);
        if (res.IsSuccessStatusCode is false)
        {
            return TypedResults.UnprocessableEntity();
        }

        var fileName = GetFileName(res);
        await using var stream = await res.Content.ReadAsStreamAsync(ct);

        var file = new FormFile(stream, 0, stream.Length, nameof(PostUpload.Request.File), fileName)
        {
            Headers = new HeaderDictionary(res.Content.Headers.ToDictionary(
                kvp => kvp.Key,
                kvp => new StringValues(kvp.Value.ToArray())))
        };
        return await handler.HandleAsync(new PostUpload.Request
        {
            File = file,
            Scope = request.Scope
        }, ct);
    }

    
    [GeneratedRegex(@"filename\*=UTF-8''(?<filename>.*)$")]
    private static partial Regex UnicodeFileNameRegex { get; }
    [GeneratedRegex("filename=\"?(?<filename>.*?)\"?$")]
    private static partial Regex AsciiFileNameRegex { get; }
    
    public static string GetFileName(HttpResponseMessage res)
    {
        var contentDisposition = res.Content.Headers.TryGetValues("Content-Disposition", out var header)
            ? header.ToArray()
            : [];
        var unicodeName = contentDisposition
            .Select(x => UnicodeFileNameRegex.Match(x))
            .FirstOrDefault(x => x.Success)?
            .Groups["filename"].Value;
        if (unicodeName is not null)
        {
            return Uri.UnescapeDataString(unicodeName);
        }
        
        var filename = contentDisposition
            .Select(x => AsciiFileNameRegex.Match(x))
            .FirstOrDefault(x => x.Success)?
            .Groups["filename"].Value;
        if (filename is not null)
        {
            return filename;
        }

        var path = res.RequestMessage?.RequestUri?.AbsolutePath;

        return path is null 
            ? Guid.NewGuid().ToString() 
            : path[(path.LastIndexOf('/') + 1)..];
    }
}