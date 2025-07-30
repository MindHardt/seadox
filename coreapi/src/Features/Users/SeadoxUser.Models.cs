using CoreApi.Infrastructure.TextIds;

namespace CoreApi.Features.Users;

public partial class SeadoxUser
{
    public record Model
    {
        public required TextId Id { get; set; }
        public required long ZitadelId { get; set; }
        public required string? AvatarUrl { get; set; }
    }
}