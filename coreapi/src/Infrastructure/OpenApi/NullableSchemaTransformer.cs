using System.Reflection;
using System.Text.Json.Serialization.Metadata;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class NullableSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        Apply(ref schema, ctx.JsonTypeInfo, ctx.JsonPropertyInfo);
        
        return Task.CompletedTask;
    }

    private static void Apply(ref OpenApiSchema schema, JsonTypeInfo jsonType, JsonPropertyInfo? jsonProp)
    {
        if (schema.AnyOf is [_, ..] anyOf)
        {
            schema.AnyOf = anyOf.Where(x => x.Title is not null).ToList();
        }
        
        var nullCtx = new NullabilityInfoContext();
        var nullInfo = jsonProp switch
        {
            { AttributeProvider: ParameterInfo param } => nullCtx.Create(param),
            { AttributeProvider: PropertyInfo prop } => nullCtx.Create(prop),
            _ => null
        };
        
        var nullState = jsonType.Type.IsOptionalType()
            ? nullInfo?.GenericTypeArguments[0].ReadState
            : nullInfo?.ReadState;
        
        if (nullState is NullabilityState.Nullable)
        {
            schema.Type |= JsonSchemaType.Null;
        }
        else
        {
            schema.Type &= ~JsonSchemaType.Null;
        }

        var jsonProps = jsonType.Properties
            .ToDictionary(x => x.Name);
        var props = jsonType.Type.GetProperties()
            .ToDictionary(x => x.GetJsonPropertyName(jsonType.Options));
        foreach (var (name, propSchema) in schema.Properties?.AsEnumerable() ?? [])
        {
            if (propSchema is not OpenApiSchema oas || props.TryGetValue(name, out var propInfo) is false)
            {
                continue;
            }
            
            var propType = JsonTypeInfo.CreateJsonTypeInfo(propInfo.PropertyType, jsonType.Options);
            Apply(ref oas, propType, jsonProps.GetValueOrDefault(name));
        }
    }
}