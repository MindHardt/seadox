using System.Reflection;
using DotNext;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class OptionalTransformer : IOpenApiSchemaTransformer
{
    private static readonly IReadOnlyCollection<PropertyInfo> SettableProps = typeof(OpenApiSchema)
        .GetProperties()
        .Where(x => x.SetMethod is not null)
        .ToArray();
    
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        if (ctx.JsonTypeInfo.Type is not { IsGenericType: true } genericType ||
            genericType.GetGenericTypeDefinition() != typeof(Optional<>))
        {
            return Task.CompletedTask;
        }
        
        var newSchema = genericType.GetGenericArguments().Single().MapTypeToOpenApiPrimitiveType();
        foreach (var prop in SettableProps)
        {
            prop.SetMethod!.Invoke(schema, [prop.GetMethod!.Invoke(newSchema, [])]);
        }
        
        return Task.CompletedTask;
    }
}