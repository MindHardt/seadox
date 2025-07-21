using System.ComponentModel;
using CoreApi.Infrastructure;
using TextId = CoreApi.Infrastructure.TextIds.TextId;

namespace CoreApi.Features.Docs;

public partial record Seadoc
{
    public record Info
    {
        public required TextId Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required TextId OwnerId { get; set; }
        public required TextId? ParentId { get; set; }
        public required DateTimeOffset CreatedAt { get; set; }
        public required DateTimeOffset UpdatedAt { get; set; }
    }
    
    public record Model : Info
    {
        [Description("Lineage of this doc, from itself to its root ancestor")]
        public required IReadOnlyCollection<Info> Lineage { get; set; }
    }
}