using System.Collections.Frozen;
using System.Diagnostics.CodeAnalysis;

namespace Seadox.CoreApi.Infrastructure.Optionals;

public static class OptionalExtensions
{
    private static readonly FrozenSet<Type> OptionalTypes =
    [
        typeof(Optional<>), typeof(QueryOptional<>)
    ];
    
    extension(Type type)
    {
        public bool IsOptionalType() => 
            type.IsGenericType && OptionalTypes.Contains(type.GetGenericTypeDefinition());

        public bool IsOptionalType([NotNullWhen(true)] out Type? wrappedType)
        {
            if (type.IsOptionalType())
            {
                wrappedType = type.GetGenericArguments()[0];
                return true;
            }

            wrappedType = null;
            return false;
        }
    }
}