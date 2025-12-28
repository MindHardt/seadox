using System.Text.Json;

namespace Seadox.CoreApi.Infrastructure.Optionals;

/*
 *  Я не горжусь тем, что написано в этом файле
 *  Но оно работает.
 *  Мне придётся отвечать перед господом за этот код.
 */

public readonly partial record struct Optional<T>
{
    private delegate bool TryParseResult(string s, out T result);

    private static readonly TryParseResult Parse = typeof(T) switch
    {
        var tString when tString == typeof(string) => (s, out value) =>
        {
            value = (T)(object)s;
            return true;
        },
        { IsEnum: true } tEnum => typeof(Enum)
            .GetMethods()
            .First(x => x.Name == nameof(Enum.TryParse) && x.GetParameters() is [
                { Name: "value", ParameterType: var valueType }, { Name: "result", IsOut: true }
            ] && valueType == typeof(string))
            .MakeGenericMethod(tEnum)
            .CreateDelegate<TryParseResult>(),
        var tParsable when tParsable.GetInterfaces().Any(x =>
                x.IsGenericType &&
                x.GetGenericTypeDefinition() == typeof(IParsable<>) &&
                x.GetGenericArguments()[0] == tParsable)
            => tParsable.GetMethod(nameof(IParsable<>.TryParse), [typeof(string), tParsable.MakeByRefType()])!
                .CreateDelegate<TryParseResult>(),
        var other => (s, out result) =>
        {
            try
            {
                result = (T)JsonSerializer.Deserialize(s, other, JsonDefaults.Options)!;
                return true;
            }
            catch (JsonException)
            {
                result = default!;
                return false;
            }
        }
    };

    /// <summary>
    /// Used for asp query binding.
    /// </summary>
    public static bool TryParse(string s, IFormatProvider? _, out Optional<T> value)
    {
        value = Parse(s, out var result) 
            ? result 
            : Undefined;

        return true;
    }
}