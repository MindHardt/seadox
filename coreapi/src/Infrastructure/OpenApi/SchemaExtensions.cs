using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.OpenApi;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public static class SchemaExtensions
{
    public static string GetJsonPropertyName(this PropertyInfo prop, JsonSerializerOptions jsonOptions) =>
        prop.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name ??
        jsonOptions.PropertyNamingPolicy?.ConvertName(prop.Name) ?? 
        prop.Name;
    
    public static IList<JsonNode> ToOpenApiEnum(this Type type) => 
        Enum.GetNames(type).Select(x => (JsonNode)x).ToList();
    
    public static void CopyTo(this OpenApiSchema source, OpenApiSchema target)
    {
        target.Title = source.Title;
        target.Schema = source.Schema;
        target.Id = source.Id;
        target.Comment = source.Comment;
        target.Vocabulary = source.Vocabulary;
        target.Type = source.Type;
        target.Format = source.Format;
        target.Description = source.Description;
        target.Maximum = source.Maximum;
        target.ExclusiveMaximum = source.ExclusiveMaximum;
        target.Minimum = source.Minimum;
        target.ExclusiveMinimum = source.ExclusiveMinimum;
        target.MaxLength = source.MaxLength;
        target.MinLength = source.MinLength;
        target.Pattern = source.Pattern;
        target.MultipleOf = source.MultipleOf;
        target.Default = source.Default;
        target.ReadOnly = source.ReadOnly;
        target.WriteOnly = source.WriteOnly;
        target.AllOf = source.AllOf;
        target.OneOf = source.OneOf;
        target.AnyOf = source.AnyOf;
        target.Not = source.Not;
        target.Required = source.Required;
        target.Items = source.Items;
        target.MaxItems = source.MaxItems;
        target.MinItems = source.MinItems;
        target.UniqueItems = source.UniqueItems;
        target.Properties = source.Properties;
        target.MaxProperties = source.MaxProperties;
        target.MinProperties = source.MinProperties;
        target.AdditionalPropertiesAllowed = source.AdditionalPropertiesAllowed;
        target.AdditionalProperties = source.AdditionalProperties;
        target.Discriminator = source.Discriminator;
        target.Example = source.Example;
        target.Enum = source.Enum;
        target.ExternalDocs = source.ExternalDocs;
        target.Deprecated = source.Deprecated;
        target.Xml = source.Xml;
        target.Extensions = source.Extensions;
        target.DynamicAnchor = source.DynamicAnchor;
        target.DynamicRef = source.DynamicRef;
        target.Definitions = source.Definitions;
        target.PatternProperties = source.PatternProperties;
        target.UnevaluatedProperties = source.UnevaluatedProperties;
        target.Metadata = source.Metadata;
        target.UnrecognizedKeywords = source.UnrecognizedKeywords;
        target.DependentRequired = source.DependentRequired;
    }
}