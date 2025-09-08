using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace CoreApi.Infrastructure.OpenApi;

public static class CustomizeOpenApi
{
    #region Schema
    public class SchemaTransformer : IOpenApiSchemaTransformer
    {
        public async Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
        {
            if (ctx.JsonTypeInfo.Type.IsAssignableTo(typeof(IOpenApiSchema)))
            {
                await (Task)ctx.JsonTypeInfo.Type.GetMethod(nameof(IOpenApiSchema.CustomizeOpenApiSchema))!.Invoke(null,
                    [schema, ctx, ct])!;
            }
        }
    }

    #endregion
    #region Operation
    
    public delegate Task OperationTransformation(
        OpenApiOperation op, OpenApiOperationTransformerContext ctx, CancellationToken ct);

    public static IEndpointConventionBuilder ConfigureOpenApi(
        this IEndpointConventionBuilder endpoint,
        OperationTransformation transformation)
        => endpoint.WithMetadata(transformation);

    public static IEndpointConventionBuilder ConfigureOpenApi(
        this IEndpointConventionBuilder endpoint,
        Action<OpenApiOperation, OpenApiOperationTransformerContext> transformation) => ConfigureOpenApi(
        endpoint, (op, ctx, _) =>
        {
            transformation(op, ctx);
            return Task.CompletedTask;
        });
    
    public class OperationTransformer : IOpenApiOperationTransformer
    {
        public Task TransformAsync(OpenApiOperation op, OpenApiOperationTransformerContext ctx, CancellationToken ct)
        {
            var transformation = ctx.Description.ActionDescriptor.EndpointMetadata
                .OfType<OperationTransformation>()
                .FirstOrDefault();
            
            return transformation?.Invoke(op, ctx, ct) ?? Task.CompletedTask;
        }
    }
    #endregion
}

public interface IOpenApiSchema
{
    public static abstract Task CustomizeOpenApiSchema(
        OpenApiSchema schema, 
        OpenApiSchemaTransformerContext ctx,
        CancellationToken ct);
}