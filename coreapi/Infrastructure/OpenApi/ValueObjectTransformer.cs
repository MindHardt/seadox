using System.ComponentModel;
using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Vogen;

namespace CoreApi.Infrastructure.OpenApi;

public class ValueObjectTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        var schemaType = ctx.JsonTypeInfo.Type;
        if (schemaType.IsGenericType && schemaType.GetGenericTypeDefinition() == typeof(Nullable<>))
        {
            schemaType = schemaType.GetGenericArguments()[0];
        }
        
        if (schemaType.GetCustomAttribute<DefaultValueAttribute>() is { Value: { } defaultValue })
        {
            schema.Example = defaultValue switch
            {
                string s => new OpenApiString(s),
                int i => new OpenApiInteger(i),
                decimal d => new OpenApiDouble((double)d),
                double d => new OpenApiDouble(d),
                _ => throw new InvalidOperationException(
                    $"Cannot add schema example for type {schemaType}, value is of type {defaultValue.GetType()}")
            };
        }
        
        if (schemaType.GetInterfaces().Contains(typeof(IRegexValidation)))
        {
            schema.Pattern = ((Regex)schemaType.GetProperty(nameof(IRegexValidation.ValidationRegex))!.GetValue(null)!).ToString();
        }
        
        var voAttribute = schemaType.GetCustomAttribute<ValueObjectAttribute>();
        if (voAttribute is null)
        {
            return Task.CompletedTask;
        }
        
        var voType = voAttribute.GetType().GetGenericArguments()[0];
        schema.Type = voType.Name switch
        {
            nameof(String) => "string",
            nameof(Int32) => "integer",
            nameof(Decimal) or nameof(Double) => "double",
            _ => throw new InvalidOperationException(
                $"Cannot infer value object type for type {schemaType}, primitive type is {voType}")
        };
        
        return Task.CompletedTask;
    }
}