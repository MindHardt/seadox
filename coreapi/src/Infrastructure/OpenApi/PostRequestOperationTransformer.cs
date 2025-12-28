using System.Net.Mime;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class PostRequestOperationTransformer : IOpenApiOperationTransformer
{
    private const string ContentType = MediaTypeNames.Multipart.FormData;
    
    public Task TransformAsync(OpenApiOperation op, OpenApiOperationTransformerContext ctx, CancellationToken ct)
    {
        if (ctx.Description.HttpMethod is "POST" && op.RequestBody is OpenApiRequestBody body)
        {
            body.Required = true;
        }
        
        if (op.RequestBody?.Content?.TryGetValue(ContentType, out var res) is not true ||
            res.Schema is not OpenApiSchema oas)
        {
            return Task.CompletedTask;
        }

        if (oas is { Properties.Count: <= 0, AllOf.Count: > 0 })
        {
            oas.Properties ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSchema>();
            var allProps = oas.AllOf
                .SelectMany(x => x.Properties?.AsEnumerable() ?? []);
            foreach (var (name, propSchema) in allProps)
            {
                oas.Properties.Add(name, propSchema);
            }
            oas.AllOf.Clear();
        }

        oas.Required = ctx.Description.ParameterDescriptions
            .Where(x => x.Type.IsOptionalType() is false)
            .Select(x => x.Name)
            .ToHashSet();
        
        return Task.CompletedTask;
    }
}