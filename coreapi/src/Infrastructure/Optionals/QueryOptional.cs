using System.Reflection;

namespace Seadox.CoreApi.Infrastructure.Optionals;

public record QueryOptional<T>(Optional<T> Value) : IBindableFromHttpContext<QueryOptional<T>>
{
    public static ValueTask<QueryOptional<T>?> BindAsync(HttpContext context, ParameterInfo parameter)
    {
        if (parameter.Name is not { } paramName ||
            context.Request.Query.TryGetValue(paramName, out var valueString) is false ||
            valueString.Count is not 1)
        {
            return ValueTask.FromResult<QueryOptional<T>?>(new QueryOptional<T>(Optional<T>.Undefined));
        }
        
        Optional<T>.TryParse(valueString!, null, out var result);
        return ValueTask.FromResult<QueryOptional<T>?>(new QueryOptional<T>(result));
    }
}