using Seadox.CoreApi.Features.Colors;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Users;

public partial class SeadoxUser
{
    public record Model
    {
        public required TextId Id { get; set; }
        public required long ZitadelId { get; set; }
        public required string? AvatarUrl { get; set; }
        public required Color Color { get; set; }
    }
}