using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class ServerUrlTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument doc, OpenApiDocumentTransformerContext ctx, CancellationToken ct)
    {
        var section = ctx.ApplicationServices.GetRequiredService<IConfiguration>().GetSection("OpenApi:Servers");
        if (section.Exists() is false)
        {
            return Task.CompletedTask;
        }
        
        var servers = section.Get<string[]>() ?? section.Value?.Split(',') ?? [];
            
        doc.Servers = servers.Select(x => new OpenApiServer { Url = x }).ToList();
        return Task.CompletedTask;
    }
}