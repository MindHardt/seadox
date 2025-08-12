using System.Text.Encodings.Web;
using System.Text.Json;

namespace CoreApi.Infrastructure;

public static class JsonDefaults
{
    public static JsonSerializerOptions Options => new JsonSerializerOptions(JsonSerializerOptions.Web).WithDefaults();
    
    public static void SetDefaults(this JsonSerializerOptions options)
    {
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        options.PropertyNameCaseInsensitive = true;
    }

    public static JsonSerializerOptions WithDefaults(this JsonSerializerOptions options)
    {
        SetDefaults(options);
        return options;
    }
}