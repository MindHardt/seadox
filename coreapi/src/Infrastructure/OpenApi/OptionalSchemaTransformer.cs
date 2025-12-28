using System.Reflection;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class OptionalSchemaTransformer : IOpenApiSchemaTransformer
{
    public async Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        await Apply(schema, ctx.JsonTypeInfo, ctx);
    }

    private static async Task Apply(OpenApiSchema schema, JsonTypeInfo json, OpenApiSchemaTransformerContext ctx)
    {
        schema.Required ??= new HashSet<string>();
        if (json.Type.GetCustomAttribute<JsonPolymorphicAttribute>() is { } jsonPoly)
        {
            var typeProp = jsonPoly.TypeDiscriminatorPropertyName ?? "$type";
            
            foreach (var option in schema.AnyOf ?? [])
            {
                option.Required?.Add(typeProp);
            }

            schema.Discriminator = null;
        }
        
        var props = json.Type
            .GetProperties()
            .ToDictionary(x => x.GetJsonPropertyName(json.Options));
        foreach (var (name, propSchema) in schema.Properties?.ToArray() ?? [])
        {
            if (props.TryGetValue(name, out var propInfo) is false)
            {
                continue;
            }
            
            if (propInfo.PropertyType.IsOptionalType())
            {
                schema.Required.Remove(name);
            }
            else
            {
                schema.Required.Add(name);
            }

            if (propSchema is not OpenApiSchema oas)
            {
                continue;
            }
            await Apply(oas, JsonTypeInfo.CreateJsonTypeInfo(props[name].PropertyType, json.Options), ctx);
            schema.Properties![name] = oas;
        }

        var type = json.Type;
        if (type.IsOptionalType(out var innerType))
        {
            var innerSchema = await ctx.GetOrCreateSchemaAsync(innerType);
            innerSchema.CopyTo(schema);
        }
    }
}