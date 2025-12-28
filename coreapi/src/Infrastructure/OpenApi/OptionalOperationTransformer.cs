using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public class OptionalOperationTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(OpenApiOperation op, OpenApiOperationTransformerContext ctx, CancellationToken ct)
    {
        var allParams = ctx.Description.ActionDescriptor.EndpointMetadata
            .OfType<IParameterBindingMetadata>()
            .ToDictionary(x => x.Name, x => x.ParameterInfo.ParameterType);
        var editableParams = op.Parameters?
            .OfType<OpenApiParameter>()
            .Where(x => x.Name is not null);
        
        foreach (var param in editableParams ?? [])
        {
            var paramType = allParams[param.Name!];
            if (paramType.IsOptionalType(out var innerType))
            {
                param.Required = false;
                if (innerType.IsEnum && param.Schema is OpenApiSchema oas)
                {
                    oas.Enum = Enum.GetNames(innerType)
                        .Select(x => (JsonNode)x)
                        .ToList();
                }
            }
            else
            {
                param.Required = true;
            }
        }

        var optionalQueryParams = allParams.Where(x => 
            x.Value.IsOptionalType() &&
            x.Value.GetGenericTypeDefinition() == typeof(QueryOptional<>));
        foreach (var (name, type) in optionalQueryParams)
        {
            var innerType = type.GetGenericArguments()[0];
            op.Parameters?.Add(new OpenApiParameter
            {
                Name = name,
                Required = false,
                In = ParameterLocation.Query,
                Schema = innerType.IsEnum
                    ? new OpenApiSchema
                    {
                        Type = JsonSchemaType.String,
                        Enum = Enum.GetNames(innerType)
                            .Select(x => (JsonNode)x)
                            .ToList()
                    }
                    : innerType.MapTypeToOpenApiPrimitiveType()
            });
        }
        
        return Task.CompletedTask;
    }
}