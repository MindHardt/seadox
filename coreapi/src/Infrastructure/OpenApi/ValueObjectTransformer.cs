using System.Reflection;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Vogen;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class ValueObjectTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        var schemaType = ctx.JsonTypeInfo.Type;
        if (schemaType.IsGenericType && schemaType.GetGenericTypeDefinition() == typeof(Nullable<>))
        {
            schemaType = schemaType.GetGenericArguments()[0];
            schema.Type |= JsonSchemaType.Null;
        }
        
        var voAttribute = schemaType.GetCustomAttribute<ValueObjectAttribute>();
        if (voAttribute is null)
        {
            return Task.CompletedTask;
        }
        
        var voType = voAttribute.GetType().GetGenericArguments()[0];
        var defaultSchema = voType.MapTypeToOpenApiPrimitiveType();

        var nullable = schema.Type?.HasFlag(JsonSchemaType.Null);
        defaultSchema.CopyTo(schema);
        if (nullable is true)
        {
            schema.Type |= JsonSchemaType.Null;
        }
        
        return Task.CompletedTask;
    }
}