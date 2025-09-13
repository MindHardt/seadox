using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using CoreApi.Features.Access;
using CoreApi.Infrastructure.OpenApi;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;
using TextId = CoreApi.Infrastructure.TextIds.TextId;

namespace CoreApi.Features.Docs;

public partial class Seadoc
{
    public record Info
    {
        public required TextId Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string? CoverUrl { get; set; }
        public required TextId OwnerId { get; set; }
        public required TextId? ParentId { get; set; }
        public required DateTimeOffset CreatedAt { get; set; }
        public required DateTimeOffset UpdatedAt { get; set; }
    }
    
    public record Model : Info, IOpenApiSchema
    {
        [JsonConverter(typeof(JsonStringEnumConverter<AccessLevel>))]
        public required AccessLevel AccessLevel { get; set; }
        
        public required DocumentShareMode Share { get; set; }
        
        [Description("Lineage of this doc, from itself to its root ancestor")]
        public required IReadOnlyCollection<Info> Lineage { get; set; }

        public required IReadOnlyCollection<Info> Children { get; set; }
        
        public static Task CustomizeOpenApiSchema(OpenApiSchema schema, OpenApiSchemaTransformerContext ctx, CancellationToken ct)
        {
            schema.Properties[JsonNamingPolicy.CamelCase.ConvertName(nameof(Children))].Items =
                new OpenApiSchema(schema.Properties[JsonNamingPolicy.CamelCase.ConvertName(nameof(Lineage))].Items);
            return Task.CompletedTask;
        }
    }
}