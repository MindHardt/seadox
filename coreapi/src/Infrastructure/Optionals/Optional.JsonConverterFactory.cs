using System.Text.Json;
using System.Text.Json.Serialization;

namespace Seadox.CoreApi.Infrastructure.Optionals;

public partial record struct Optional<T>
{
    public class JsonConverter : JsonConverter<Optional<T>>
    {
        public override Optional<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) 
            => FromValue(JsonSerializer.Deserialize<T>(ref reader, options)!);

        public override void Write(Utf8JsonWriter writer, Optional<T> value, JsonSerializerOptions options)
            => JsonSerializer.Serialize(writer, value.Value, options);
    }
}

public class OptionalJsonConverterFactory : JsonConverterFactory {
    public override bool CanConvert(Type typeToConvert) => 
        typeToConvert.IsOptionalType();

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options) => 
        Activator.CreateInstance(typeof(Optional<>.JsonConverter).MakeGenericType(typeToConvert.GetGenericArguments().Single())) 
            as JsonConverter;
}