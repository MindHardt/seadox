using CoreApi.Infrastructure.TextIds;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace CoreApi.Infrastructure.OpenApi;

public class SchemaNamingTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
    {
        var type = ctx.JsonTypeInfo.Type;
        schema.Title = GetTypeName(type);
        
        return Task.CompletedTask;
    }

    public static string? GetTypeName(Type type)
    {
        var primitive = type == typeof(TextId) || type.Assembly == typeof(int).Assembly;
        if (primitive)
        {
            return null;
        }
        
        var collectionType = type.IsGenericType && type
            .GetInterfaces()
            .Where(x => x.IsGenericType)
            .Any(x => x.GetGenericTypeDefinition() == typeof(IEnumerable<>));
        if (collectionType)
        {
            type = type.GetGenericArguments()[0];
        }
        var nullableType = type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        if (nullableType)
        {
            type = type.GetGenericArguments()[0];
        }
        
        var paginatedType = type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Paginated.Response<>);
        if (paginatedType)
        {
            type = type.GetGenericArguments()[0];
        }
        
        var typeName = type.FullName!;
        var title = typeName[(typeName.LastIndexOf('.') + 1)..].Replace("+", string.Empty);
        if (nullableType)
        {
            title += "OrNull";
        }

        if (collectionType)
        {
            title = "CollectionOf" + title;
        }

        if (paginatedType)
        {
            title = "PaginatedResponseOf" + title;
        }

        return title;
    }
}