using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Seadox.CoreApi.Infrastructure.Optionals;

namespace Seadox.CoreApi.Infrastructure;

public static class JsonDefaults
{
    public static JsonSerializerOptions Options { get; }

    static JsonDefaults()
    {
        Options = new JsonSerializerOptions(JsonSerializerOptions.Web).WithDefaults();
        Options.MakeReadOnly();
    }
    
    extension(JsonSerializerOptions options)
    {
        public void SetDefaults()
        {
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
            options.PropertyNameCaseInsensitive = true;
            options.RespectNullableAnnotations = true;
            options.NumberHandling = JsonNumberHandling.Strict;
            options.Converters.Add(new JsonStringEnumConverter());
            options.Converters.Add(new OptionalJsonConverterFactory());
        }

        public JsonSerializerOptions WithDefaults()
        {
            SetDefaults(options);
            return options;
        }
    }
}