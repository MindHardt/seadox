using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using DotNext.Text.Json;

namespace Seadox.CoreApi.Infrastructure;

public static class JsonDefaults
{
    public static JsonSerializerOptions Options => new JsonSerializerOptions(JsonSerializerOptions.Web).WithDefaults();
    
    public static void SetDefaults(this JsonSerializerOptions options)
    {
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        options.PropertyNameCaseInsensitive = true;
        options.Converters.Add(new JsonStringEnumConverter());
        options.Converters.Add(new OptionalConverterFactory());
    }

    public static JsonSerializerOptions WithDefaults(this JsonSerializerOptions options)
    {
        SetDefaults(options);
        return options;
    }
}